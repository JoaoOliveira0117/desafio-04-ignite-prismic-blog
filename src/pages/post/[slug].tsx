import { GetStaticPaths, GetStaticProps } from 'next';
import { getPrismicClient } from '../../services/prismic';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { format } from 'date-fns';
import Header from '../../components/Header';
import ptBR from 'date-fns/locale/pt-BR';
import { useRouter } from 'next/router';

import styles from './post.module.scss';
import { RichText } from 'prismic-dom';
import { useEffect, useState } from 'react';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const { isFallback } = useRouter();
  const [readingTime, setReadingTime] = useState(0);

  useEffect(() => {
    const body = post?.data?.content.reduce(
      (acc, word) => [...acc, word.body],
      []
    );

    const contentAsArray = body?.reduce((acc, next) => {
      return [...acc, RichText.asText(next)];
    }, []);

    const contentAsString = contentAsArray?.reduce((acc, next, idx) => {
      return idx == 0 ? next : acc + ', ' + next;
    }, '');

    const words = contentAsString?.split(' ');

    setReadingTime(Math.ceil(words?.length / 200));
  }, [post]);

  console.log(isFallback);

  if (isFallback) {
    return <p>Carregando...</p>;
  }

  return (
    <>
      <div className={styles.Header}>
        <Header />
      </div>
      <div className={styles.ImageContainer}>
        <img
          src={post?.data?.banner?.url}
          alt={`${post?.data?.title} banner`}
        />
      </div>
      <div className={styles.container}>
        <div>
          <h1 className={styles.title}>{post?.data.title}</h1>
          <div className={styles.DateAuthorWrapper}>
            <div className={styles.DateWrapper}>
              <FiCalendar />
              <p>
                {format(new Date(post?.first_publication_date), 'dd MMM yyyy', {
                  locale: ptBR,
                })}
              </p>
            </div>
            <div className={styles.AuthorWrapper}>
              <FiUser />
              <p>{post?.data.author}</p>
            </div>
            <div className={styles.ReadingTimeWrapper}>
              <FiClock />
              <p>{readingTime} min</p>
            </div>
          </div>
        </div>
        <div className={styles.PostContainer}>
          {post?.data.content.map(c => (
            <>
              <div className={styles.PostTitle}>{c.heading}</div>
              <div
                className={styles.PostContent}
                key={c.heading}
                dangerouslySetInnerHTML={{ __html: RichText.asHtml(c.body) }}
              />
            </>
          ))}
        </div>
      </div>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [
      { params: { slug: 'como-utilizar-hooks' } },
      { params: { slug: 'criando-um-app-cra-do-zero' } },
    ],
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient();

  const post: Post = await prismic.getByUID('posts', String(slug), {});

  return {
    props: {
      post,
    },
    revalidate: 10,
  };
};
