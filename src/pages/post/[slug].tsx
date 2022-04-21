import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import React from 'react';
import { useRouter } from 'next/router';

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

  return isFallback ? (
    <h2>Carregando...</h2>
  ) :
  (
    <>
      <Head>
        <title>{ post.data.title } | spacetraveling.</title>
      </Head>
      <main>
        <section className={styles.postBanner}>
          <img src={post.data.banner.url} alt="Banner" />
        </section>
        <div className={commonStyles.container}>
          <article className={styles.postContent}>

            <h1>{post.data.title}</h1>

            <div className={`${commonStyles.postInfo} ${styles.postInfo}`}>
              <time><FiCalendar />{post.first_publication_date}</time>
              <span><FiUser />{post.data.author}</span>
              <span><FiClock /> {
                Math.ceil(
                  post.data.content.reduce((total, content) => {
                    total += content.body.reduce(
                      (total, paragraph) => (total += paragraph.text.match(/\S+\s*/g).length),
                      0
                    );
                    return total;
                  }, 0) / 200
                )
              } min</span>
            </div>

            {
              post.data.content.map( content => (
                <React.Fragment key={content.heading}>
                  <h2>{ content.heading }</h2>
                  {
                    content.body.map( (paragraph, id) => (
                      <React.Fragment key={id}>
                        <p>{paragraph.text}</p>
                        <br />
                      </React.Fragment>
                    ))
                  }
                </React.Fragment>
                
              ))
            }
          </article>
        </div>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType('post');

  // const paths = posts.results.map( path => ( { params: {slug: path.uid}} ))

  return {
    paths: [],
    fallback: true
    // O teste exige que utilize fallback true para renderizar tela de loading
  }
};

export const getStaticProps: GetStaticProps = async ({ params }) => {

  const { slug } = params;

  const prismic = getPrismicClient({});
  const response = await prismic.getByUID('post', String(slug), {});

  const post = {
    first_publication_date: format(
      new Date(response.first_publication_date),
      "dd MMMM yyyy", {
        locale: ptBR
      }),
    data: {
      title: response.data.title,
      banner: {
        url: response.data.banner.url
      },
      author: response.data.author,
      content: response.data.content
    }
  }

  return {
    props: {
      post
    }
  }
};
