import Link from 'next/link';
import { GetStaticProps } from 'next';
import { getPrismicClient } from '../services/prismic';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { format } from 'date-fns';
import Header from '../components/Header';
import ptBR from 'date-fns/locale/pt-BR';
import Prismic from '@prismicio/client';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { useEffect, useState } from 'react';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const [posts, setPosts] = useState<Post[]>(postsPagination?.results);
  const [nextPage, setNextPage] = useState<string>(postsPagination?.next_page);

  const handleOnClick = async url => {
    const response = await fetch(url).then(res => res.json());

    const next_page = response.next_page;

    setPosts([...posts, ...response.results]);
    setNextPage(next_page);
  };

  return (
    <>
      <div className={styles.Header}>
        <Header />
      </div>
      <main className={styles.postsContainer}>
        {posts?.map(post => (
          <Link href={`/post/${post.uid}`} key={post.uid}>
            <a>
              <div className={styles.post}>
                <h1 className={styles.postTitle}>{post.data.title}</h1>
                <p className={styles.postSubtitle}>{post.data.subtitle}</p>
                <div className={styles.DateAuthorWrapper}>
                  <div className={styles.DateWrapper}>
                    <FiCalendar />
                    <p>
                      {format(
                        new Date(post.first_publication_date),
                        'dd MMM yyyy',
                        {
                          locale: ptBR,
                        }
                      )}
                    </p>
                  </div>
                  <div className={styles.AuthorWrapper}>
                    <FiUser />
                    <p>{post.data.author}</p>
                  </div>
                </div>
              </div>
            </a>
          </Link>
        ))}

        {nextPage && (
          <button
            className={styles.button}
            onClick={() => handleOnClick(nextPage)}
          >
            Carregar mais posts
          </button>
        )}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['publication.title', 'publication.content'],
      pageSize: 5,
      orderings: '[document.first_publication_date]',
    }
  );

  const { next_page } = postsResponse;

  const results = postsResponse.results.map((post: Post) => {
    return post;
  });

  return {
    props: {
      postsPagination: {
        results,
        next_page,
      },
    },
    revalidate: 60 * 60 * 24,
  };
};
