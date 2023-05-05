import { Link, Outlet } from 'umi';
import styles from './index.less';
import vconsole from './vconsole';

export default function Layout() {
  vconsole.show()
  return (
    <div className={styles.navs}>
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/docs">Docs</Link>
        </li>
        <li>
          <a href="https://github.com/umijs/umi">Github</a>
        </li>
      </ul>
      <Outlet />  
    </div>


  );
}
