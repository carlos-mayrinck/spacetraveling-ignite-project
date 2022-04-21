import Link from 'next/link';
import commonStyles from '../../styles/common.module.scss';
import styles from './header.module.scss';

export default function Header() {
  return (
    <header className={commonStyles.container}>
      <div className={styles.headerContainer}>
        <Link href="/">
          <a>
            <img src="/img/Logo.svg" alt="logo" />
          </a>
        </Link>
      </div>
    </header>
  );
}
