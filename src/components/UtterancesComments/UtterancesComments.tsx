import styles from './utterancesComments.module.scss';

export const UtterancesComments: React.FC = () => (
  <section
    className={styles.utterances}
    ref={elem => {
      if (!elem || elem.childNodes.length) {
        return;
      }
      const scriptElem = document.createElement('script');
      scriptElem.src = 'https://utteranc.es/client.js';
      scriptElem.async = true;
      scriptElem.crossOrigin = 'annonymous';
      scriptElem.setAttribute(
        'repo',
        'JoaoOliveira0117/desafio-04-ignite-prismic-blog'
      );
      scriptElem.setAttribute('issue-term', 'pathname');
      scriptElem.setAttribute('theme', 'github-dark');
      elem.appendChild(scriptElem);
    }}
  />
);
