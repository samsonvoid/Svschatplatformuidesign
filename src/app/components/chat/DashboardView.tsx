import type { User, Chat } from '../../App';

interface DashboardViewProps {
  currentUser: User;
  chats: Chat[];
  onSelectChat: (chatId: string) => void;
  setActiveTab: (tab: 'chats' | 'dashboard' | 'files' | 'settings') => void;
}

export function DashboardView({
  currentUser,
  chats,
  onSelectChat,
  setActiveTab
}: DashboardViewProps) {
  
  const handleQuickChat = (chatName: string) => {
    // Find the matching chat (group or direct) and redirect the user
    const targetChat = chats.find(c => {
      const name = c.type === 'group' ? c.group!.name : c.user!.name;
      return name.toLowerCase().includes(chatName.toLowerCase());
    });
    if (targetChat) {
      onSelectChat(targetChat.id);
      setActiveTab('chats');
    }
  };

  return (
    <main className="flex-1 overflow-y-auto p-lg bg-surface hide-scrollbar h-full">
      <header className="mb-xl">
        <h1 className="font-headline-lg text-headline-lg mb-xs font-black text-on-surface">Welcome back, {currentUser.name}</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">Here is a snapshot of your team's activity today.</p>
      </header>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-12 gap-lg pb-24 md:pb-6">
        {/* Active Team Members (Asymmetric Bento) */}
        <section className="col-span-12 lg:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-lg">
            <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">Active Team Members</h2>
            <button className="text-primary font-label-md text-label-md hover:underline cursor-pointer">View Directory</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
            {/* Neema */}
            <div 
              onClick={() => handleQuickChat('Neema')}
              className="p-md bg-surface-container-low rounded-lg border border-outline-variant flex flex-col items-center text-center transition-all hover:border-primary cursor-pointer hover:scale-[1.03]"
            >
              <div className="relative mb-sm">
                <img alt="Neema profile" className="w-16 h-16 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA-SnAPBXeqztqdjPSSZE7o0DRAydecmHb8ZdThdek0HnLH5AvvxB33qhlNcNivOjBl9H27Rao0E4go6OGdcdo5UGS3ge1NhuRhR3xe7aKwknkJCculUQH5-zBW8PMz-zEfmCtoCY7jJ4aSOmvxVnraip1ehItkQ3RgJxQilGuIK7mRpNsws2EktJLN6iB1l5OOuBLGjLqY75tOjTiMTbfDHPOPDpNN4dc4Z6suPPuwWcdyObz_R_hp82dVJJujkBGJ_8MH2nKMJ46i" />
                <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-surface-container-low rounded-full"></span>
              </div>
              <h3 className="font-label-md text-label-md font-bold text-on-surface">Neema</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Design System Lead</p>
              <span className="mt-sm px-sm py-[2px] bg-primary-container text-on-primary-container rounded-full text-[10px] font-bold">IN MEETING</span>
            </div>
            
            {/* Jamali */}
            <div 
              onClick={() => handleQuickChat('Jamali')}
              className="p-md bg-surface-container-low rounded-lg border border-outline-variant flex flex-col items-center text-center transition-all hover:border-primary cursor-pointer hover:scale-[1.03]"
            >
              <div className="relative mb-sm">
                <img alt="Jamali profile" className="w-16 h-16 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBCPQQYKJpNA5jd1VjdBDcDwLhDNGA59CdxkjOyVhJvMpia9w59tOwSokbTb5SMUjo__jk2RrKpLF6shcM0R5MYEvARXJziz6-ByZTUKRm8snciuCODUq8Ytvez7uG5CRhrTHD1W-hHxId8xUK48HEx0LQ4ot-4z0WV07MGLCB4d1a3h_Jb33-GllgsNM1t2ACOV61IMzHOyLzkqNx1q1FEqa7alHPoPcCQv8DL7k5IlH97b6MYoyno3CBnSUeYJ4pSi-WLoneFGhAq" />
                <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-surface-container-low rounded-full"></span>
              </div>
              <h3 className="font-label-md text-label-md font-bold text-on-surface">Jamali</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Backend Dev</p>
              <span className="mt-sm px-sm py-[2px] bg-tertiary-container text-on-tertiary rounded-full text-[10px] font-bold">CODING</span>
            </div>
            
            {/* Fatuma */}
            <div 
              onClick={() => handleQuickChat('Frontend Team')}
              className="p-md bg-surface-container-low rounded-lg border border-outline-variant flex flex-col items-center text-center transition-all hover:border-primary cursor-pointer hover:scale-[1.03]"
            >
              <div className="relative mb-sm">
                <div className="w-16 h-16 rounded-full bg-tertiary-container text-on-tertiary flex items-center justify-center font-bold text-lg">FA</div>
                <span className="absolute bottom-0 right-0 w-4 h-4 bg-yellow-500 border-2 border-surface-container-low rounded-full"></span>
              </div>
              <h3 className="font-label-md text-label-md font-bold text-on-surface">Fatuma</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Product Manager</p>
              <span className="mt-sm px-sm py-[2px] bg-surface-container-highest text-on-surface rounded-full text-[10px] font-bold">AWAY</span>
            </div>
          </div>
        </section>

        {/* Shared Files (Asymmetric Bento) */}
        <section className="col-span-12 lg:col-span-4 bg-primary text-on-primary rounded-xl p-lg shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <h2 className="font-headline-sm text-headline-sm font-bold mb-lg">Shared Files</h2>
            <div className="space-y-md">
              <div className="flex items-center gap-md bg-white/10 p-sm rounded-lg hover:bg-white/20 transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-surface-container-highest">description</span>
                <div className="overflow-hidden">
                  <p className="font-label-md text-label-md truncate">Project_Brief_v2.pdf</p>
                  <p className="text-[10px] opacity-70">Uploaded by Fatuma • 2h ago</p>
                </div>
              </div>
              <div className="flex items-center gap-md bg-white/10 p-sm rounded-lg hover:bg-white/20 transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-surface-container-highest">image</span>
                <div className="overflow-hidden">
                  <p className="font-label-md text-label-md truncate">landing_page_wireframe.png</p>
                  <p className="text-[10px] opacity-70">Uploaded by Neema • 5h ago</p>
                </div>
              </div>
              <div className="flex items-center gap-md bg-white/10 p-sm rounded-lg hover:bg-white/20 transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-surface-container-highest">table_chart</span>
                <div className="overflow-hidden">
                  <p className="font-label-md text-label-md truncate">budget_planning_Q4.xlsx</p>
                  <p className="text-[10px] opacity-70">Uploaded by Jamali • Yesterday</p>
                </div>
              </div>
            </div>
          </div>
          <button className="mt-lg w-full bg-white text-primary py-sm rounded-lg font-label-md text-label-md hover:bg-white/90 transition-colors cursor-pointer">View All Files</button>
        </section>

        {/* Recent Activity (Full Width Bento) */}
        <section className="col-span-12 bg-white border border-outline-variant rounded-xl p-lg shadow-sm">
          <div className="flex justify-between items-center mb-lg">
            <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">Recent Message Activity</h2>
            <button className="material-symbols-outlined text-on-surface-variant cursor-pointer">more_horiz</button>
          </div>
          <div className="space-y-md">
            {/* Jamali activity */}
            <div 
              onClick={() => handleQuickChat('Jamali')}
              className="flex gap-md items-start p-md rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer"
            >
              <img alt="Jamali" className="w-10 h-10 rounded-full object-cover flex-shrink-0" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBCPQQYKJpNA5jd1VjdBDcDwLhDNGA59CdxkjOyVhJvMpia9w59tOwSokbTb5SMUjo__jk2RrKpLF6shcM0R5MYEvARXJziz6-ByZTUKRm8snciuCODUq8Ytvez7uG5CRhrTHD1W-hHxId8xUK48HEx0LQ4ot-4z0WV07MGLCB4d1a3h_Jb33-GllgsNM1t2ACOV61IMzHOyLzkqNx1q1FEqa7alHPoPcCQv8DL7k5IlH97b6MYoyno3CBnSUeYJ4pSi-WLoneFGhAq" />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <h4 className="font-label-md text-label-md font-bold text-on-surface">Jamali</h4>
                  <span className="text-on-surface-variant font-label-sm text-label-sm">10:45 AM</span>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant mt-xs">I've pushed the latest API documentation updates. Let me know if the endpoints look clear for the frontend integration.</p>
                <div className="mt-sm flex gap-sm">
                  <span className="px-sm py-1 bg-surface-container rounded-full text-[11px] text-primary font-medium">#development</span>
                  <span className="px-sm py-1 bg-surface-container rounded-full text-[11px] text-primary font-medium">#docs</span>
                </div>
              </div>
            </div>
            
            {/* Neema activity */}
            <div 
              onClick={() => handleQuickChat('Neema')}
              className="flex gap-md items-start p-md rounded-lg bg-primary-container/10 border-l-4 border-primary cursor-pointer hover:bg-primary-container/20 transition-colors"
            >
              <img alt="Neema" className="w-10 h-10 rounded-full object-cover flex-shrink-0" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA-SnAPBXeqztqdjPSSZE7o0DRAydecmHb8ZdThdek0HnLH5AvvxB33qhlNcNivOjBl9H27Rao0E4go6OGdcdo5UGS3ge1NhuRhR3xe7aKwknkJCculUQH5-zBW8PMz-zEfmCtoCY7jJ4aSOmvxVnraip1ehItkQ3RgJxQilGuIK7mRpNsws2EktJLN6iB1l5OOuBLGjLqY75tOjTiMTbfDHPOPDpNN4dc4Z6suPPuwWcdyObz_R_hp82dVJJujkBGJ_8MH2nKMJ46i" />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <h4 className="font-label-md text-label-md font-bold text-on-surface">Neema</h4>
                  <span className="text-on-surface-variant font-label-sm text-label-sm">09:12 AM</span>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant mt-xs">Great work! The Tailwind config looks clean and consistent with our new design tokens.</p>
              </div>
            </div>
            
            {/* Group activity */}
            <div 
              onClick={() => handleQuickChat('Frontend Team')}
              className="flex gap-md items-start p-md rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-white flex-shrink-0">
                <span className="material-symbols-outlined">group</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <h4 className="font-label-md text-label-md font-bold text-on-surface">Frontend Team</h4>
                  <span className="text-on-surface-variant font-label-sm text-label-sm">08:50 AM</span>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant mt-xs"><span className="font-bold text-on-surface">Fatuma:</span> The new component library looks amazing! Ready for the sprint review.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Projects Stats Card */}
        <section className="col-span-12 md:col-span-6 bg-surface-container-high rounded-xl p-lg border border-outline-variant shadow-sm flex flex-col justify-between">
          <h3 className="font-label-md text-label-md font-bold mb-md uppercase tracking-wider opacity-60 text-on-surface">Sprint Progress</h3>
          <div className="flex items-end gap-lg">
            <div className="flex-1">
              <p className="font-headline-lg text-headline-lg font-black text-on-surface">78%</p>
              <div className="w-full bg-surface-container-lowest h-2 rounded-full mt-sm overflow-hidden">
                <div className="bg-primary h-full w-[78%]"></div>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="font-label-sm text-label-sm text-on-surface-variant">12 Tasks Remaining</p>
            </div>
          </div>
        </section>

        {/* Decorative Bento */}
        <div className="col-span-12 md:col-span-6 h-[180px] rounded-xl overflow-hidden border border-outline-variant relative group shadow-sm">
          <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD-Hi-WDxbuMaoovsTfYeHmBBMrHnOVlZ8RJeF5oWhFofpV8NPhS708ze5g5bL1raFmZ5OxEZ-7F1t-1rif5ahZbogVp36LZTH5sVXLbKbQInl1KKBuQaOGEyFtM0i4uLGA4qA7W1xTvmMEnZJ6ChFCJ9Yxvf1tpGlQJQip2q9EnrLVszUSgfJFzxU_VGoBNuLaR6oVtGZn3ligk8vL3FaOwffQqDrO_Jomvnv_xXbOhbue6iwHCIv_WVC62mErm-dhZJ_F0QTW_yhC" alt="Workspace design" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-md">
            <p className="text-white font-label-md text-label-md">Main Office - Building A</p>
          </div>
        </div>
      </div>
    </main>
  );
}
