import Link from 'next/link';

import styles from './header.module.scss';

export default function Header() {
  return (
    <>
      <div className={styles.headerContainer}>
        <Link href="/">
            <a>
              <img className={styles.headerVector} src="/images/codeVector.svg" alt="logo"/>
              <h1 className={styles.headerText}>
                blogatin<span className={styles.dot}>.</span>
              </h1>
            </a>
        </Link>
      </div>
    </>
  )
}
