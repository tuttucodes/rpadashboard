import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <span>RPA feedback dashboard</span>
      <span className={styles.dot}>•</span>
      <span>Dr Umesh K</span>
      <span className={styles.dot}>•</span>
      <span>VIT Chennai</span>
    </footer>
  )
}
