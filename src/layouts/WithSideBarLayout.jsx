import SidebarWithHeader from '../components/Nav/SidebarWithHeader';

export default function WithSideBarLayout({children}) {
  return (
    <>
      <SidebarWithHeader>
        {children}
      </SidebarWithHeader>
    </>
  );
}
