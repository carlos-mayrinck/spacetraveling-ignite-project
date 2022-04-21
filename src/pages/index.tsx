import Head from 'next/head';
import Link from 'next/link';
import { FiCalendar, FiUser } from 'react-icons/fi';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { GetStaticProps } from 'next';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { useState } from 'react';

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

function parsePosts(posts: Post[]) {
  const parsedPosts = posts.map( post => {
    return {
      uid: post.uid,
      first_publication_date: format(
        new Date(post.first_publication_date),
        'dd MMMM yyyy',
        {
          locale: ptBR
        }),
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author
      }
    }
  });

  return parsedPosts;
}

export default function Home({ postsPagination: { next_page, results } }: HomeProps) {

  const [posts, setPosts] = useState<Post[]>(results)
  const [nextPage, setNextPage] = useState<string | null>(next_page);

  async function handleLoadingMorePosts() {
    const postResponse = await fetch(nextPage).then(res => res.json());
    const newPosts = parsePosts(postResponse.results);
    setPosts([...posts, ...newPosts]);
    setNextPage(postResponse.next_page);
  }

  return (
    <>
      <Head>
        <title>Home | spacetraveling.</title>
      </Head>

      <main className={commonStyles.container}>
        <div className={styles.postsContainer}>
          {
            posts.map(post => (
              <Link key={post.uid} href={`/post/${post.uid}`}>
                <a className={styles.post}>
                  <h2>{post.data.title}</h2>
                  <p>{post.data.subtitle}</p>
                  <div className={commonStyles.postInfo}>
                    <time><FiCalendar />{post.first_publication_date}</time>
                    <span><FiUser />{post.data.author}</span>
                  </div>
                </a>
              </Link>
            ))
          }
          {
            nextPage && (
              <button
                type='button'
                onClick={handleLoadingMorePosts}
                className={styles.loadMoreButton}
              >
                Carregar mais posts
              </button>
            )
          }
        </div>
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});

  const postsResponse = await prismic.getByType('post', {
    fetch: [
      "post.title",
      "post.subtitle",
      "post.author"
    ],
    pageSize: 2,
  });

  const posts = postsResponse.results.map( post => {
    return {
      uid: post.uid,
      first_publication_date: format(
        new Date(post.first_publication_date),
        'dd MMMM yyyy',
        {
          locale: ptBR
        }),
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author
      }
    }
  });

  const { next_page } = postsResponse;

  return {
    props: {
      postsPagination: {
        next_page,
        results: posts
      }
    },
    revalidate: 60 * 30 // 30 minutes
  }
};
