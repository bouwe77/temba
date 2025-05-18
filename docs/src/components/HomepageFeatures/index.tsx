import React from "react";
import clsx from "clsx";
import Heading from "@theme/Heading";
import styles from "./styles.module.css";
import { useColorMode } from "@docusaurus/theme-common";

type FeatureItem = {
  title: string;
  Svg: {
    light: React.ComponentType<React.ComponentProps<"svg">>;
    dark: React.ComponentType<React.ComponentProps<"svg">>;
  };
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: "Low-Code API in 30s",
    Svg: {
      light: require("@site/static/img/history-svgrepo-com-light.svg").default,
      dark: require("@site/static/img/history-svgrepo-com-dark.svg").default,
    },
    description: (
      <>Spin up your CRUD API without touching a single line of code.</>
    ),
  },
  {
    title: "Your API, your rules",
    Svg: {
      light: require("@site/static/img/sort-by-svgrepo-com-light.svg").default,
      dark: require("@site/static/img/sort-by-svgrepo-com-dark.svg").default,
    },
    description: (
      <>Customize endpoints, schemas & storage via intuitive config.</>
    ),
  },
  {
    title: "Fully Documented",
    Svg: {
      light: require("@site/static/img/notes-lines-alt-svgrepo-com-light.svg")
        .default,
      dark: require("@site/static/img/notes-lines-alt-svgrepo-com-dark.svg")
        .default,
    },
    description: (
      <>
        Your API comes with out-of-the-box human- and machine-readable OpenAPI
        specs.
      </>
    ),
  },
  {
    title: "Storage",
    Svg: {
      light: require("@site/static/img/database-svgrepo-com-light.svg").default,
      dark: require("@site/static/img/database-svgrepo-com-dark.svg").default,
    },
    description: <>Store your data in memory, JSON, or MongoDB.</>,
  },
  {
    title: "Focus on features",
    Svg: {
      light: require("@site/static/img/bullseye-pointer-svgrepo-com-light.svg")
        .default,
      dark: require("@site/static/img/bullseye-pointer-svgrepo-com-dark.svg")
        .default,
    },
    description: (
      <>Stay in your flow—skip backend boilerplate and focus on features.</>
    ),
  },
  {
    title: "Iterate faster",
    Svg: {
      light: require("@site/static/img/lightbulb-on-svgrepo-com-light.svg")
        .default,
      dark: require("@site/static/img/lightbulb-on-svgrepo-com-dark.svg")
        .default,
    },
    description: (
      <>
        Prototype & experiment instantly, so you can innovate without
        roadblocks.
      </>
    ),
  },
];

type Props = {
  children: React.ReactNode;
  title: string;
  description: JSX.Element;
} & FeatureItem;

function Feature({ children, title, description }: Props) {
  return (
    <div className={clsx("col col--4")}>
      <div className="text--center">{children}</div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  const { colorMode } = useColorMode();
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => {
            const Svg = props.Svg[colorMode];
            return (
              <Feature key={idx} {...props}>
                <Svg className={styles.featureSvg} role="img" />
              </Feature>
            );
          })}
        </div>
      </div>
    </section>
  );
}
