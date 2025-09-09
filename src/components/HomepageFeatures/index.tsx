import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: '随时随地访问',
    Svg: require('@site/static/img/undraw_docusaurus_mountain.svg').default,
    description: (
      <>
        无论您身处何地，使用何种设备，均可无缝访问您的数据与文件。支持多平台同步，提供流畅的跨端体验，确保您的工作与协作永不中断。
      </>
    ),
  },
  {
    title: '隐私优先',
    Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default,
    description: (
      <>
        您的每个账本都运行在一个独立的、受保护的容器环境中，确保用户间的数据严格隔离。我们通过动态资源管理来提供高效且私密的访问体验
      </>
    ),
  },
  {
    title: '支持自托管',
    Svg: require('@site/static/img/undraw_docusaurus_react.svg').default,
    description: (
      <>
        提供完整的自托管解决方案，允许您在私有服务器上部署服务，完全掌握数据存储与管理流程，满足定制化需求与企业级合规要求。
      </>
    ),
  },
];

function Feature({title, Svg, description}: FeatureItem) {
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
  );
}

export default function HomepageFeatures(): ReactNode {
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
  );
}
