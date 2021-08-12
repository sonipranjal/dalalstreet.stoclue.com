import Link from 'next/link';
import Image from 'next/image';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import classNames from 'classnames';
import ActionButton from './ActionButton';
import { useAuthState } from '../context/auth';
import { useRouter } from 'next/router';

import { Post } from '../types';
import {
  FaRegBookmark,
  FaRegCommentAlt,
  FaRegShareSquare,
} from 'react-icons/fa';
import { ImArrowDown, ImArrowUp } from 'react-icons/im';
import axios from 'axios';

dayjs.extend(relativeTime);

interface PostCardProps {
  post: Post;
  revalidate?: Function;
}

const PostCard = ({
  post: {
    createdAt,
    title,
    slug,
    identifier,
    subName,
    url,
    body,
    username,
    userVote,
    voteScore,
    commentCount,
    sub,
  },
  revalidate,
}: PostCardProps) => {
  const { authenticated } = useAuthState();

  const router = useRouter();

  const isInSubPage = router.pathname === '/s/[sub]';

  const vote = async (value: number) => {
    if (!authenticated) router.push('/login');

    if (value === userVote) value = 0;
    try {
      const res = await axios.post('/misc/vote', {
        identifier,
        slug,
        value,
      });
      if (revalidate) revalidate();
    } catch (err) {}
  };

  return (
    <div id={identifier} className="flex mb-4 bg-white rounded select-none">
      {/* Vote Section   */}
      <div className="w-10 py-3 text-center bg-white rounded-l">
        <ImArrowUp
          onClick={() => vote(1)}
          className={classNames(
            'w-6 p-1 mx-auto text-3xl text-gray-400 rounded cursor-pointer hover:bg-gray-200 hover:text-red-500',
            {
              'text-red-500': userVote === 1,
            }
          )}
        />
        <p className="text-xs font-bold ">{voteScore}</p>
        <ImArrowDown
          onClick={() => vote(-1)}
          className={classNames(
            'w-6 p-1 mx-auto text-3xl text-gray-400 rounded cursor-pointer hover:bg-gray-200 hover:text-blue-600',
            {
              'text-blue-600': userVote === -1,
            }
          )}
        />
      </div>
      {/* Post data section */}
      <div className="w-full p-2">
        <div className="flex items-center">
          {!isInSubPage && (
            <>
              <Link href={`/s/${subName}`}>
                <a>
                  <Image
                    src={sub.imageUrl}
                    alt="avatar"
                    width={25}
                    height={25}
                    className="rounded-full"
                  />
                </a>
              </Link>
              <Link href={`/s/${subName}`}>
                <a className="text-xs font-bold cursor-pointer hover:underline">
                  /s/{subName}
                </a>
              </Link>
              <span className="mx-1 text-xs text-gray-500">•</span>
            </>
          )}
          <p className="text-xs text-gray-500">
            <span className="mx-1">•</span>
            Posted by
            <Link href={`/u/${username}`}>
              <a className="mx-1 hover:underline">/u/{username}</a>
            </Link>
            <Link href={url}>
              <a className="mx-1 hover:underline">
                {dayjs(createdAt).fromNow()}
              </a>
            </Link>
          </p>
        </div>
        <Link href={url}>
          <a className="my-1 text-lg font-medium">{title}</a>
        </Link>
        {body && <p className="my-1 text-sm">{body}</p>}
        <div className="flex">
          <Link href={url}>
            <a>
              <ActionButton>
                <FaRegCommentAlt className="inline-block mr-2" />
                <span className="font-medium text-gray-500">
                  {commentCount} Comments
                </span>
              </ActionButton>
            </a>
          </Link>
          <ActionButton>
            <FaRegShareSquare className="inline-block mr-2" />
            <span className="font-medium text-gray-500">Share</span>
          </ActionButton>
          <ActionButton>
            <FaRegBookmark className="inline-block mr-2" />
            <span className="font-medium text-gray-500">Save</span>
          </ActionButton>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
