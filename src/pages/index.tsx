import Link from 'next/link';
import { GetStaticProps } from 'next';
import { getPrismicClient } from '../services/prismic';
import { FiCalendar, FiUser } from "react-icons/fi";
import { format } from 'date-fns'
import ptBR from 'date-fns/locale/pt-BR';
import Prismic from '@prismicio/client';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

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
  next_page?: string; //MUDAR DPS
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ results }: PostPagination) {
  return (
    <>
      <main className={styles.postsContainer}>
        {results.map(post => 
          <Link href={`/post/${post.uid}`}>
            <a key={post.uid}>
              <div className={styles.post}>
                <h1 className={styles.postTitle}>{post.data.title}</h1>
                <p className={styles.postSubtitle}>{post.data.subtitle}</p>
                <div className={styles.DateAuthorWrapper}>
                  <div className={styles.DateWrapper}>
                    <FiCalendar/>
                    <p>{format(new Date(post.first_publication_date), 'dd MMM yyyy', {
                      locale: ptBR,
                    })}</p>
                  </div>
                  <div className={styles.AuthorWrapper}>
                    <FiUser/>
                    <p>{post.data.author}</p>
                  </div>
                </div>
              </div>
            </a>
          </Link>
        )}
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type', 'posts')
  ],{
    fetch: ['publication.title','publication.content'],
    pageSize: 20,
  });

  const results = postsResponse.results.map((post: Post) => {
    return post
  })

  return {
    props:{
      results
    },
    revalidate: 60*60*24,
  }
};
