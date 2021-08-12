import { isEmpty } from 'class-validator';
import { Request, Response, Router, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import path from 'path';
import fs from 'fs';

import multer, { FileFilterCallback } from 'multer';

import Sub from '../entities/Sub';
import User from '../entities/User';
import Post from '../entities/Post';

import auth from '../middleware/auth';
import user from '../middleware/user';
import { makeId } from '../util/helpers';

const createSub = async (req: Request, res: Response) => {
  const { name, title, description } = req.body;

  const user: User = res.locals.user;

  try {
    let errors: any = {};
    if (isEmpty(name)) errors.name = 'Name must not be empty';
    if (isEmpty(title)) errors.title = 'Title must not be empty';

    const sub = await getRepository(Sub)
      .createQueryBuilder('sub')
      .where('lower(sub.name) = :name', { name: name.toLowerCase() })
      .getOne();

    if (sub) {
      errors.name = 'Sub exists already';
    }

    if (Object.keys(errors).length > 0) {
      throw errors;
    }
  } catch (err) {
    return res.status(400).json(err);
  }

  try {
    const sub = new Sub({ name, description, title, user });
    await sub.save();
    return res.json(sub);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Something went wrong!' });
  }
};

const getSub = async (req: Request, res: Response) => {
  const name = req.params.name;

  try {
    const sub = await Sub.findOneOrFail({ name });

    const posts = await Post.find({
      where: { sub },
      relations: ['comments', 'votes'],
      order: { createdAt: 'DESC' },
    });

    sub.posts = posts;

    if (res.locals.user) {
      sub.posts.forEach((post) => post.setUserVote(res.locals.user));
    }

    return res.json(sub);
  } catch (err) {
    console.log(err);
    return res.status(404).json({ sub: 'Sub not found ' });
  }
};

const ownSub = async (req: Request, res: Response, next: NextFunction) => {
  const user: User = res.locals.user;

  try {
    const sub = await Sub.findOneOrFail({ where: { name: req.params.name } });

    if (sub.username !== user.username) {
      return res.status(403).json({ error: "You don't own this sub" });
    }

    res.locals.sub = sub;

    return next();
  } catch (err) {
    return res.status(500).json({ error: 'Something went wrong' });
  }
};

const upload = multer({
  storage: multer.diskStorage({
    destination: 'public/images',
    filename: function (_, file, callback) {
      const name = makeId(6);
      callback(null, name + '-' + Date.now() + path.extname(file.originalname));
    },
  }),
  fileFilter: (_, file: any, callback: FileFilterCallback) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      callback(null, true);
    } else {
      callback(new Error('Not an Image'));
    }
  },
});

const uploadSubImage = async (req: Request, res: Response) => {
  const sub: Sub = res.locals.sub;
  try {
    const type = req.body.type;
    const filePath: any = req.file?.path;
    if (type !== 'image' && type !== 'banner') {
      fs.unlinkSync(filePath);
      return res.status(400).json({ error: 'Invalid type' });
    }

    let oldImageUrn: string = '';
    const urn: any = req.file?.filename;
    if (type === 'image') {
      oldImageUrn = sub.imageUrn || '';
      sub.imageUrn = urn;
    } else if (type === 'banner') {
      oldImageUrn = sub.bannerUrn || '';
      sub.bannerUrn = urn;
    }
    await sub.save();

    if (oldImageUrn !== '') {
      fs.unlinkSync(`public/images/${oldImageUrn}`);
    }
    return res.json(sub);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Something went wrong' });
  }
};

const searchSubs = async (req: Request, res: Response) => {
  try {
    const name = req.params.name;

    if (isEmpty(name)) {
      return res.status(400).json({ error: 'Name must not be empty' });
    }

    // reactJS , reactjs
    const subs = await getRepository(Sub)
      .createQueryBuilder()
      // react => rea
      .where('LOWER(name) LIKE :name', {
        name: `${name.toLowerCase().trim()}%`,
      })
      .getMany();

    return res.json(subs);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Something went wrong' });
  }
};

const router = Router();

router.post('/', user, auth, createSub);
router.get('/:name', user, getSub);
router.get('/search/:name', searchSubs);
router.post(
  '/:name/image',
  user,
  auth,
  ownSub,
  upload.single('file'),
  uploadSubImage
);

export default router;
