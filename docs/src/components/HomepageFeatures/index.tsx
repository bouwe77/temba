import clsx from 'clsx'
import Heading from '@theme/Heading'
import styles from './styles.module.css'

type FeatureItem = {
  title: string
  Svg: React.ComponentType<React.ComponentProps<'svg'>>
  description: JSX.Element
}

const FeatureList: FeatureItem[] = [
  {
    title: 'Thingy 1',
    Svg: require('@site/static/img/undraw_docusaurus_mountain.svg').default,
    description: <>Piet, hondenstront</>,
  },
  {
    title: 'Thingy 2',
    Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default,
    description: <>Tering Henkie.</>,
  },
  {
    title: 'Thingy 3',
    Svg: require('@site/static/img/undraw_docusaurus_react.svg').default,
    description: <>Jodelahietie</>,
  },
]

function Feature({ title, Svg, description }: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  )
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  )
}
