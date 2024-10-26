const Header = ({ children }: { children: React.ReactNode }) => {
  return <header className='border-b w-full py-4 flex justify-around items-center'>{children}</header>
}

export default Header
