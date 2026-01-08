import React from 'react'
import clsx from 'clsx'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import Layout from '@theme/Layout'
import HomepageFeatures from '@site/src/components/HomepageFeatures'
import Heading from '@theme/Heading'
import styles from './index.module.css'
import CodeBlock from '@theme/CodeBlock' // Docusaurus’s built-in code renderer
import Link from '@docusaurus/Link'

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext()
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link className={`button ${styles.docsButton}`} to="/docs/documentation">
            Straight to the docs 🚀
          </Link>
        </div>
      </div>
    </header>
  )
}

function CodeSection() {
  return (
    <section className={clsx('container margin-vert--xl', styles.codeSection)}>
      <h1 className="text--center">Do you haz teh codez?</h1>
      <b>1. Installation</b>
      <CodeBlock className={styles.codeBlock} language="bash">
        {`npm i temba`}
      </CodeBlock>
      <b>2. Code</b>
      <CodeBlock className={styles.codeBlock} language="javascript">
        {`import { create } from "temba"
const server = await create()
server.start()`}
      </CodeBlock>
      <b>3. Run</b>
      <CodeBlock className={styles.codeBlock} language="bash">
        {`✅ Server listening on port 8362`}
      </CodeBlock>
      <b>Or instead, combine all these steps into just using the CLI</b>
      <CodeBlock className={styles.codeBlock} language="bash">
        {`npx temba-cli create my-api`}
      </CodeBlock>
    </section>
  )
}

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext()
  return (
    <Layout title={`${siteConfig.title}`} description={siteConfig.tagline}>
      <HomepageHeader />
      <main>
        <HomepageFeatures />
        <CodeSection />
      </main>
    </Layout>
  )
}
