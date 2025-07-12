import { Home, LetterText, BookOpen, Palette, Image } from 'lucide-react'
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from '#app/components/ui/sidebar'

const items = [
	{
		title: 'Home',
		url: '/',
		icon: Home,
	},
	{
		title: 'ABC Learning',
		url: '/abc',
		icon: LetterText,
	},
	{
		title: 'Word Reading',
		url: '/words',
		icon: BookOpen,
	},
	{
		title: 'Colors',
		url: '/colors',
		icon: Palette,
	},
	{
		title: 'Flashcards',
		url: '/flashcards',
		icon: Image,
	},
]

export function AppSidebar() {
	return (
		<Sidebar>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Games</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{items.map((item) => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton asChild>
										<a href={item.url}>
											<item.icon />
											<span>{item.title}</span>
										</a>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
		</Sidebar>
	)
}