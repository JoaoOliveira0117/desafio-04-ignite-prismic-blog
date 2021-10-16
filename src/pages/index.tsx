import { GetStaticProps } from 'next';

import { getPrismicClient } from '../services/prismic';
import Prismic from '@prismicio/client';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

import Header from '../components/Header/index';

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
      <main className={commonStyles.contentContainer}>
        <Header/>
        {results.map(post => 
          <>
            <h1>{post.data.title}</h1>
            <h2>{post.data.subtitle}</h2>
            <p>{post.data.author}</p>
            <p>{post.first_publication_date}</p>
          </>
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
