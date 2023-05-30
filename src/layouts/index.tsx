import { Link, Outlet,useNavigate } from 'umi';
import styles from './index.less';
import VConsole from "vconsole"

import React, { FC } from 'react'
import { NavBar, TabBar } from 'antd-mobile'
import {
  useLocation,
  MemoryRouter as Router,
  BrowserRouter,
} from 'react-router-dom'
import {
  AppOutline,
  MessageOutline,
  UnorderedListOutline,
  UserOutline,
  SmileOutline,
  ChatCheckOutline,
} from 'antd-mobile-icons'

const Bottom: FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { pathname } = location

  const setRouteActive = (value: string) => {
    navigate(value)
  }

  const tabs = [
    // {
    //   key: '/',
    //   title: '首页',
    //   icon: <AppOutline />,
    // },
    {
      key: '/draw',
      title: 'Draw',
      icon: <MessageOutline />,
    },
    // {
    //   key: '/move',
    //   title: 'Move',
    //   icon: <UnorderedListOutline />,
    // },

    // {
    //   key: '/game',
    //   title: 'Game',
    //   icon: <UserOutline />,
    // },
    {
      key: '/circle',
      title: 'circle',
      icon: <SmileOutline />,
    },
    // {
    //   key: '/movegv',
    //   title: 'movegv',
    //   icon: <ChatCheckOutline />,
    // },
  ]

  return (
    <TabBar activeKey={pathname} onChange={value => setRouteActive(value)}>
      {tabs.map(item => (
        <TabBar.Item 
          key={item.key} 
          icon={item.icon} 
          title={item.title} />
      ))}
    </TabBar>
  )
}



export default () => {
  // if location url query contains ?debug=true, show vconsole
  if (window.location.href.indexOf('debug=true') > -1) {
    let vc = new VConsole()
    vc.hide()
  }
  
  return (
      <div className={styles.app}>
        <div className={styles.body}>
          <Outlet />
        </div>
          <div className={styles.bottom}>
          <Bottom />
        </div>
      </div>
    
  )
}

// export default function Layout() {
//     vconsole.show()
//   vconsole.hide()
//   return (
//     <div className={styles.navs}>
//       <ul>
//         <li>
//           <Link to="/">Home</Link>
//         </li>
//         <li>
//           <Link to="/docs">Docs</Link>
//         </li>
//         <li>
//           <a href="https://github.com/umijs/umi">Github</a>
//         </li>
//       </ul>
//       <Outlet />  
//     </div>
//   );
// }
