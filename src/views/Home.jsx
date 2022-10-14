import React from 'react'
import WithSideBarLayout from '../layouts/WithSideBarLayout'
import CallToActionWithVideo from '../components/Home/Hero'

export default function Home() {
  return (
    <WithSideBarLayout>
      <CallToActionWithVideo/>
    </WithSideBarLayout>
  )
}
