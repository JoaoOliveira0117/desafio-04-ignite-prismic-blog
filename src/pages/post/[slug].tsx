import Link from 'next/link';
import Prismic from '@prismicio/client';
import { GetStaticPaths, GetStaticProps } from 'next';
import { getPrismicClient } from '../../services/prismic';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { format, isAfter } from 'date-fns';
import Header from '../../components/Header';
import ptBR from 'date-fns/locale/pt-BR';
import { useRouter } from 'next/router';

import styles from './post.module.scss';
import { RichText } from 'prismic-dom';
import React, { useEffect, useState } from 'react';
import { UtterancesComments } from '../../components/UtterancesComments/UtterancesComments';

interface Post {
  id: string;
  uid?: string;
  first_publication_date: string | null;
  last_publication_date: string | null;
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
  nextPost?: Post;
  prevPost?: Post;
}

export default function Post({ post, nextPost, prevPost }: PostProps) {
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

  function reduceString(string: String, size: number) {
    if (!string) {
      return '';
    }

    if (string.length < size) {
      return string;
    }

    return string.substring(0, size) + '...';
  }

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
            <div className={styles.DateAuthorFlex}>
              <div className={styles.DateWrapper}>
                <FiCalendar />
                <p>
                  {format(
                    new Date(post?.first_publication_date),
                    'dd MMM yyyy',
                    {
                      locale: ptBR,
                    }
                  )}
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

            {isAfter(
              new Date(post?.last_publication_date),
              new Date(post?.first_publication_date)
            ) && (
              <div className={styles.isEdited}>
                {format(
                  new Date(post?.last_publication_date),
                  "'*editado em 'dd MMM yyyy 'ás' HH:mm",
                  {
                    locale: ptBR,
                  }
                )}
              </div>
            )}
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

        <div className={styles.border} />

        <div className={styles.postNav}>
          <div>
            {prevPost && (
              <Link href={`/post/${prevPost?.uid}`} key={prevPost?.uid}>
                <a className={styles.postNavWrapper}>
                  <p className={styles.postNavTitle}>
                    {reduceString(prevPost?.data.title, 20)}
                  </p>
                  <h3 className={styles.postNavHint}>Post Anterior</h3>
                </a>
              </Link>
            )}
          </div>
          <div className={styles.postNavNext}>
            {nextPost && (
              <Link href={`/post/${nextPost?.uid}`} key={nextPost?.uid}>
                <a className={styles.postNavWrapper}>
                  <p className={styles.postNavTitle}>
                    {reduceString(nextPost?.data.title, 20)}
                  </p>
                  <h3 className={styles.postNavHint}>Próximo post</h3>
                </a>
              </Link>
            )}
          </div>
        </div>
      </div>
      <div>
        <UtterancesComments />
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

  const prevPost: Post = (
    await prismic.query(Prismic.predicates.at('document.type', 'posts'), {
      pageSize: 1,
      after: `${post.id}`,
      orderings: '[document.first_publication_date desc]',
    })
  ).results[0];

  const nextPost: Post = (
    await prismic.query(Prismic.predicates.at('document.type', 'posts'), {
      pageSize: 1,
      after: `${post.id}`,
      orderings: '[document.first_publication_date]',
    })
  ).results[0];

  return {
    props: {
      post,
      nextPost: nextPost || null,
      prevPost: prevPost || null,
    },
    revalidate: 10,
  };
};
