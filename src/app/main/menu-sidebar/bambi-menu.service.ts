import { Injectable } from '@angular/core';

type MenuSubEntry = { title: string, id: string, route: string }
type MenuEntry = { title: string, id: string, icon: string, route: string, subEntries: MenuSubEntry[] }

@Injectable({
	providedIn: 'root'
})
export class BambiMenuService {

	menuOpen: boolean;
	bambiMenu: MenuEntry[];
	groupControl: { [key: string]: boolean };

	constructor() {
		this.menuOpen = false;
		this.bambiMenu = [
			{ title: 'APPMENU.DASHBOARD', id: 'dash', icon: 'space_dashboard', route: '/dashboard', subEntries: [] },
			{ title: 'APPMENU.EDITOR', id: 'editor', icon: 'editor', route: '/editor', subEntries: [] },
			{ title: 'APPMENU.COLLAPS', id: 'collaps', icon: 'format_line_spacing', route: '/collaps', subEntries: [{ title: 'APPMENU.COLLAPSEDITOR', id: 'collapsedit', route: '/collaps/editor' }, { title: 'APPMENU.COLLAPSPARAMS', id: 'collapssettings', route: '/collaps/params' },] },
			{ title: 'APPMENU.IMPORT', id: 'import', icon: 'file_upload', route: '/import', subEntries: [] },
			{ title: 'APPMENU.EXPORT', id: 'export', icon: 'file_download', route: '/export', subEntries: [] },
			{ title: 'APPMENU.IMAGES', id: 'images', icon: 'image', route: '/images', subEntries: [] },
			{ title: 'APPMENU.MANUALS', id: 'manuals', icon: 'cloud', route: '/manuals', subEntries: [] },
			{ title: 'APPMENU.HTMLSNIPPETS', id: 'snippets', icon: 'code', route: '/snippets', subEntries: [{ title: 'APPMENU.HTMLSNIPPETSCOLS', id: 'htcols', route: '/snippets/cols' }, { title: 'APPMENU.HTMLSNIPPETSELES', id: 'hteles', route: '/snippets/eles' },] },
			{ title: 'APPMENU.SETTINGS', id: 'settings', icon: 'manage_accounts', route: '/settings', subEntries: [] }
		];
		this.groupControl = { 'collaps': false, 'snippets': false }
	}

	ToggleMenu(operation: 'open' | 'close') {
		operation === 'open' ? this.menuOpen = true : this.menuOpen = false;
	}

	ToggleGroup(groupID: string) {
		this.groupControl[`${groupID}`] = !this.groupControl[`${groupID}`]
	}
}
