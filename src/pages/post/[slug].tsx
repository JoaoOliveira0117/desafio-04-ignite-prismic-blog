import { GetStaticPaths, GetStaticProps } from 'next';
import { getPrismicClient } from '../../services/prismic';
import { FiCalendar, FiUser } from "react-icons/fi";
import { format } from 'date-fns'
import ptBR from 'date-fns/locale/pt-BR';
import Prismic from '@prismicio/client';


import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { RichText } from 'prismic-dom';

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
  return (
    <>
      <div>
        <h1>{post.data.title}</h1>
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
      <div>
        {post.data.content.map(c => (
          <div
            dangerouslySetInnerHTML={{__html: RichText.asHtml(c.body)}}/>
        ))}
      </div>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query([
    Prismic.predicates.at('document.type', 'posts')
  ],{
    fetch: ['publication.title','publication.content'],
    pageSize: 20,
  });;

  return {
    paths: [
      { params: { slug: posts.results[0].uid } },
      { params: { slug: posts.results[1].uid } },
    ],
    fallback: true,
  }
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  console.log(slug);

  const prismic = getPrismicClient();

  const post: Post = await prismic.getByUID('posts', String(slug), {});

  return {
    props:{
      post
    },
    revalidate: 60*60*24,
  }
};
