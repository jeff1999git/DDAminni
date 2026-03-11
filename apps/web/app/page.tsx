"use client";

import React, {useEffect, useState} from 'react';

type Tab = 'family' | 'cleaning' | 'sticky';

type FamilyMember = {
  id: string;
  name: string;
  room: string;
  status: 'current' | 'former';
  phone?: string;
};

type CleaningArea = 'dining' | 'living' | 'kitchen';

type CleaningRecord = {
  area: CleaningArea;
  assignedRoom: string;
  completed: boolean;
  completedAt?: string | null;
};

type StickyNote = {
  id: string;
  name: string;
  description: string;
  createdAt: string;
};

function FamilyIcon({color}: {color: string}) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
  );
}

function CleaningIcon({color}: {color: string}) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
      <polyline points="9 22 9 12 15 12 15 22"></polyline>
      <path d="M9 12h2M15 12h2"></path>
    </svg>
  );
}

function StickyIcon({color}: {color: string}) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z"></path>
      <polyline points="12 12 12 12"></polyline>
    </svg>
  );
}

function EditPencilIcon() {
	return (
		<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
			<path d="M12 20h9"></path>
			<path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"></path>
		</svg>
	);
}

function DeleteTrashIcon() {
	return (
		<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
			<polyline points="3 6 5 6 21 6"></polyline>
			<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
			<path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
			<line x1="10" y1="11" x2="10" y2="17"></line>
			<line x1="14" y1="11" x2="14" y2="17"></line>
		</svg>
	);
}

const CLEANING_META: Record<CleaningArea, {icon: string; label: string}> = {
  dining: {icon: '🍽️', label: 'Dining Room'},
  living: {icon: '🛋️', label: 'Living Room'},
  kitchen: {icon: '🍳', label: 'Kitchen'},
};

function getISOWeekId(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayOfWeek = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayOfWeek);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

function getWeekLabel(weekId: string): string {
  const [yearStr, weekStr] = weekId.split('-W');
  const year = parseInt(yearStr);
  const week = parseInt(weekStr);
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const dayOfJan4 = jan4.getUTCDay() || 7;
  const monday = new Date(jan4);
  monday.setUTCDate(jan4.getUTCDate() - dayOfJan4 + 1 + (week - 1) * 7);
  const fullMonths = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const monthName = fullMonths[monday.getUTCMonth()];
  const weekOfMonth = Math.ceil(monday.getUTCDate() / 7);
  const ordinals = ['','1st','2nd','3rd','4th','5th'];
  return `${monthName} ${ordinals[weekOfMonth]} Week`;
}

function shiftWeek(weekId: string, delta: number): string {
  const [yearStr, weekStr] = weekId.split('-W');
  const year = parseInt(yearStr);
  const week = parseInt(weekStr);
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const dayOfJan4 = jan4.getUTCDay() || 7;
  const monday = new Date(jan4);
  monday.setUTCDate(jan4.getUTCDate() - dayOfJan4 + 1 + (week - 1) * 7 + delta * 7);
  return getISOWeekId(monday);
}

function BottomNav({active, onChange}:{active:Tab; onChange:(t:Tab)=>void}){
  const tabs = [
    {id:'family', label:'Family', icon: FamilyIcon, color:'#22c55e'},
    {id:'cleaning', label:'Cleaning', icon: CleaningIcon, color:'#10b981'},
    {id:'sticky', label:'Sticky notes', icon: StickyIcon, color:'#84cc16'},
  ];

  return (
    <nav style={{
      position: 'fixed',
      left:0, right:0, bottom:0,
      height:72,
      display:'flex',
      justifyContent:'space-around',
      alignItems:'center',
      borderTop:'1px solid #374151',
      background:'black',
      boxShadow:'0 -1px 4px rgba(0,0,0,0.2)'
    }}>
      {tabs.map(tab => (
        <button 
          key={tab.id}
          onClick={()=>onChange(tab.id as Tab)} 
          style={{
            background:'none',
            border:'none',
            padding:12,
            fontSize:12,
            display:'flex',
            flexDirection:'column',
            alignItems:'center',
            gap:4,
            cursor:'pointer',
            color: active === tab.id ? tab.color : '#d1d5db',
            transition:'color 0.2s'
          }}
        >
          <span style={{fontSize:24}}><tab.icon color={active === tab.id ? tab.color : '#d1d5db'} /></span>
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}

export default function Page(){
	const [tab, setTab] = useState<Tab>('family');
	const [members, setMembers] = useState<FamilyMember[]>([]);
	const [loadingMembers, setLoadingMembers] = useState(false);
	const [membersError, setMembersError] = useState('');
	const [showModal, setShowModal] = useState(false);
	const [formData, setFormData] = useState<{name:string, room:string, status:'current'|'former', phone:string}>({name:'', room:'', status:'current', phone:''});
	const [editId, setEditId] = useState<string | null>(null);
	const [expandedRoom, setExpandedRoom] = useState<string | null>(null);
	const [cleaningWeek, setCleaningWeek] = useState(() => getISOWeekId(new Date()));
	const [cleaningSchedule, setCleaningSchedule] = useState<CleaningRecord[]>([]);
	const [loadingCleaning, setLoadingCleaning] = useState(false);
	const [cleaningError, setCleaningError] = useState('');
	const [stickyNotes, setStickyNotes] = useState<StickyNote[]>([]);
	const [loadingStickyNotes, setLoadingStickyNotes] = useState(false);
	const [stickyNotesError, setStickyNotesError] = useState('');
	const [stickyFormData, setStickyFormData] = useState({name:'', description:''});
	const [showStickyModal, setShowStickyModal] = useState(false);

	useEffect(() => {
		let isMounted = true;
		const loadMembers = async () => {
			setLoadingMembers(true);
			setMembersError('');
			try {
				const response = await fetch('/api/family', { cache: 'no-store' });
				const data = await response.json();
				if (!response.ok || !data.ok) {
					throw new Error(data.error || 'Failed to load members');
				}
				if (isMounted) {
					setMembers((data.members || []).map((m: any) => ({
						id: m._id,
						name: m.name,
						room: m.room,
						status: m.status,
						phone: m.phone || '',
					})));
				}
			} catch (err: any) {
				if (isMounted) {
					setMembersError(err.message || 'Failed to load members');
				}
			} finally {
				if (isMounted) {
					setLoadingMembers(false);
				}
			}
		};

		loadMembers();
		return () => {
			isMounted = false;
		};
	}, []);

	useEffect(() => {
		if (tab !== 'cleaning') return;
		let isMounted = true;
		const loadCleaning = async () => {
			setLoadingCleaning(true);
			setCleaningError('');
			try {
				const res = await fetch(`/api/cleaning?week=${cleaningWeek}`, { cache: 'no-store' });
				const data = await res.json();
				if (!res.ok || !data.ok) throw new Error(data.error || 'Failed to load cleaning schedule');
				if (isMounted) setCleaningSchedule(data.schedule || []);
			} catch (err: any) {
				if (isMounted) setCleaningError(err.message || 'Failed to load cleaning schedule');
			} finally {
				if (isMounted) setLoadingCleaning(false);
			}
		};
		loadCleaning();
		return () => { isMounted = false; };
	}, [tab, cleaningWeek]);

	useEffect(() => {
		if (tab !== 'sticky') return;
		let isMounted = true;
		const loadStickyNotes = async () => {
			setLoadingStickyNotes(true);
			setStickyNotesError('');
			try {
				const res = await fetch('/api/sticky', { cache: 'no-store' });
				const data = await res.json();
				if (!res.ok || !data.ok) throw new Error(data.error || 'Failed to load notes');
				if (isMounted) {
					const notes = (data.notes || []).map((n: any) => ({
						id: n._id,
						name: n.name,
						description: n.description,
						createdAt: new Date(n.createdAt).toLocaleDateString(),
					}));
					setStickyNotes(notes);
				}
			} catch (err: any) {
				if (isMounted) setStickyNotesError(err.message || 'Failed to load notes');
			} finally {
				if (isMounted) setLoadingStickyNotes(false);
			}
		};
		loadStickyNotes();
		return () => { isMounted = false; };
	}, [tab]);

	const handleAddMember = async () => {
		if (!formData.name.trim() || (formData.status === 'current' && !formData.room)) return;

		try {
			setMembersError('');
			if (editId) {
				const response = await fetch(`/api/family/${editId}`, {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(formData),
				});
				const data = await response.json();
				if (!response.ok || !data.ok) {
					throw new Error(data.error || 'Failed to update member');
				}
				setMembers(members.map(m => m.id === editId ? {
					id: data.member._id || editId,
					name: data.member.name,
					room: data.member.room,
					status: data.member.status,
					phone: data.member.phone || '',
				} : m));
				setEditId(null);
			} else {
				const response = await fetch('/api/family', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(formData),
				});
				const data = await response.json();
				if (!response.ok || !data.ok) {
					throw new Error(data.error || 'Failed to add member');
				}
				setMembers([{ 
					id: data.member._id,
					name: data.member.name,
					room: data.member.room,
					status: data.member.status,
					phone: data.member.phone || '',
				}, ...members]);
			}

			setFormData({name:'', room:'', status:'current', phone:''});
			setShowModal(false);
		} catch (err: any) {
			setMembersError(err.message || 'Failed to save member');
		}
	};

	const handleEdit = (member: FamilyMember) => {
		setFormData({name: member.name, room: member.status === 'current' ? member.room : '', status: member.status, phone: member.phone || ''});
		setEditId(member.id);
		setShowModal(true);
	};

	const handleDelete = async (id: string) => {
		try {
			setMembersError('');
			const response = await fetch(`/api/family/${id}`, {
				method: 'DELETE',
			});
			const data = await response.json();
			if (!response.ok || !data.ok) {
				throw new Error(data.error || 'Failed to delete member');
			}
			setMembers(members.filter(m => m.id !== id));
		} catch (err: any) {
			setMembersError(err.message || 'Failed to delete member');
		}
	};

	const handleAddStickyNote = async () => {
		if (!stickyFormData.name || !stickyFormData.description.trim()) return;
		setStickyNotesError('');
		try {
			const res = await fetch('/api/sticky', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(stickyFormData),
			});
			const data = await res.json();
			if (!res.ok || !data.ok) throw new Error(data.error || 'Failed to add note');
			const newNote: StickyNote = {
				id: data.note._id,
				name: data.note.name,
				description: data.note.description,
				createdAt: new Date(data.note.createdAt).toLocaleDateString(),
			};
			setStickyNotes([newNote, ...stickyNotes]);
			setStickyFormData({name:'', description:''});
			setShowStickyModal(false);
		} catch (err: any) {
			setStickyNotesError(err.message || 'Failed to add note');
		}
	};

	const handleCloseStickyModal = () => {
		setShowStickyModal(false);
		setStickyFormData({name:'', description:''});
		setStickyNotesError('');
	};

	const handleDeleteStickyNote = async (id: string) => {
		setStickyNotesError('');
		try {
			const res = await fetch(`/api/sticky/${id}`, { method: 'DELETE' });
			const data = await res.json();
			if (!res.ok || !data.ok) throw new Error(data.error || 'Failed to delete note');
			setStickyNotes(stickyNotes.filter(n => n.id !== id));
		} catch (err: any) {
			setStickyNotesError(err.message || 'Failed to delete note');
		}
	};

	const handleCloseModal = () => {
		setShowModal(false);
		setEditId(null);
		setFormData({name:'', room:'', status:'current', phone:''});
	};

	const handleCleaningToggle = async (area: CleaningArea) => {
		const current = cleaningSchedule.find(r => r.area === area);
		const newCompleted = !(current?.completed ?? false);
		setCleaningError('');
		try {
			const res = await fetch('/api/cleaning', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ weekId: cleaningWeek, area, completed: newCompleted }),
			});
			const data = await res.json();
			if (!res.ok || !data.ok) throw new Error(data.error || 'Failed to update');
			setCleaningSchedule(prev => prev.map(r => r.area === area ? { ...r, completed: newCompleted, completedAt: newCompleted ? new Date().toISOString() : null } : r));
		} catch (err: any) {
			setCleaningError(err.message || 'Failed to update cleaning status');
		}
	};

	return (
		<main style={{paddingBottom: 100, paddingTop:20, paddingLeft:16, paddingRight:16}}>
			<header style={{marginBottom:18}}>
				<h1 style={{margin:0,fontSize:20}}>DD അമ്മിണി</h1>
				<p style={{margin:'4px 0 0 0', fontSize:13, color:'#9ca3af'}}>115 A Cleaning Assistant</p>
			</header>

			<section style={{minHeight: '60vh'}}>
				{tab === 'family' && (
					<div>
						<h2 style={{marginTop:0, marginBottom:20}}>Family Members</h2>
						{loadingMembers && <p style={{color:'#d1d5db', marginTop:0}}>Loading members...</p>}
						{membersError && <p style={{color:'#f87171', marginTop:0}}>{membersError}</p>}

						{showModal && (
							<div style={{position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.5)', display:'flex', justifyContent:'center', alignItems:'center', zIndex:1000}}>
								<div style={{background:'black', padding:24, borderRadius:12, width:'90%', maxWidth:400, boxShadow:'0 20px 25px rgba(0,0,0,0.15)'}}>
									<h3 style={{marginTop:0, marginBottom:16}}>{editId ? 'Edit Member' : 'Add Family Member'}</h3>
									
									<select 
										value={formData.status}
										onChange={(e) => setFormData({...formData, status: e.target.value as 'current' | 'former'})}
										style={{width:'100%', padding:10, marginBottom:16, border:'1px solid #d1d5db', borderRadius:6, boxSizing:'border-box', fontSize:14, background:'#374151', color:'white'}}
									>
										<option value="current">Current Resident</option>
										<option value="former">Former Resident</option>
									</select>

									<input 
										type="text" 
										placeholder="Name" 
										value={formData.name}
										onChange={(e) => setFormData({...formData, name: e.target.value})}
										style={{width:'100%', padding:10, marginBottom:12, border:'1px solid #d1d5db', borderRadius:6, boxSizing:'border-box', fontSize:14, background:'#374151', color:'white'}}
									/>
									
									{formData.status === 'current' && (
										<>
											<select 
												value={formData.room}
												onChange={(e) => setFormData({...formData, room: e.target.value})}
												style={{width:'100%', padding:10, marginBottom:12, border:'1px solid #d1d5db', borderRadius:6, boxSizing:'border-box', fontSize:14, background:'#374151', color:'white'}}
											>
												<option value="">Select Room</option>
												<option value="Room 1">Room 1</option>
												<option value="Room 2">Room 2</option>
												<option value="Room 3">Room 3</option>
											</select>
											<input 
												type="tel" 
												placeholder="Phone (optional)" 
												value={formData.phone}
												onChange={(e) => setFormData({...formData, phone: e.target.value})}
												style={{width:'100%', padding:10, marginBottom:16, border:'1px solid #d1d5db', borderRadius:6, boxSizing:'border-box', fontSize:14, background:'#374151', color:'white'}}
										/>
									</>
									)}
									
									<div style={{display:'flex', gap:12}}>
										<button 
											onClick={handleAddMember}
											style={{flex:1, padding:10, background:'#22c55e', color:'#fff', border:'none', borderRadius:6, cursor:'pointer', fontSize:14, fontWeight:500}}
										>
											{editId ? 'Update' : 'Add'}
										</button>
										<button 
											onClick={handleCloseModal}
											style={{flex:1, padding:10, background:'#374151', color:'white', border:'none', borderRadius:6, cursor:'pointer', fontSize:14, fontWeight:500}}
										>
											Cancel
										</button>
									</div>
								</div>
							</div>
						)}

						{/* Room-based view */}
						<div>
							{['Room 1', 'Room 2', 'Room 3'].map(room => {
								const roomMembers = members.filter(m => m.room === room && m.status === 'current');
								const isExpanded = expandedRoom === room;
								return (
									<div key={room} style={{marginBottom:16}}>
										<button
											onClick={() => setExpandedRoom(isExpanded ? null : room)}
											style={{
												width:'100%',
												background:'#1f2937',
												padding:14,
												border:'none',
												borderRadius:8,
												borderLeft: `4px solid #10b981`,
												textAlign:'left',
												cursor:'pointer',
												display:'flex',
												justifyContent:'space-between',
												alignItems:'center'
											}}
										>
											<div>
												<p style={{margin:0, fontWeight:600, color:'white', marginBottom:4}}>{room}</p>
												<p style={{margin:0, fontSize:12, color:'#9ca3af'}}>
													{roomMembers.length === 0 ? 'No members' : roomMembers.map(m => m.name.split(' ')[0]).join(', ')}
												</p>
											</div>
											<span style={{color:'#22c55e', fontSize:18}}>
												{isExpanded ? '−' : '+'}
											</span>
										</button>
										
										{isExpanded && (
											<div style={{background:'#374151', marginTop:0, borderRadius: '0 0 8px 8px', padding:12}}>
												{roomMembers.length === 0 ? (
													<p style={{margin:0, fontSize:13, color:'#9ca3af'}}>No members in this room</p>
												) : (
													roomMembers.map(member => (
														<div key={member.id} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid #4b5563'}}>
															<div style={{flex:1}}>
																<p style={{margin:0, fontWeight:500, color:'white'}}>{member.name}</p>
																<p style={{margin:'2px 0 0 0', fontSize:12, color:'#d1d5db'}}>
																	{member.status === 'current' ? 'Current' : 'Former'}
																</p>
															</div>
															<div style={{display:'flex', gap:6}}>
																<button onClick={() => handleEdit(member)} aria-label="Edit member" title="Edit" style={{width:28, height:28, background:'#22c55e', color:'#fff', border:'none', borderRadius:6, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'}}><EditPencilIcon /></button>
																<button onClick={() => handleDelete(member.id)} aria-label="Delete member" title="Delete" style={{width:28, height:28, background:'#ef4444', color:'#fff', border:'none', borderRadius:6, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'}}><DeleteTrashIcon /></button>
															</div>
														</div>
													))
												)}
											</div>
										)}
									</div>
								);
							})}

							{(() => {
								const formerMembers = members.filter(m => m.status === 'former');
								const isExpanded = expandedRoom === 'Former Members';
								return (
									<div style={{marginBottom:16}}>
										<button
											onClick={() => setExpandedRoom(isExpanded ? null : 'Former Members')}
											style={{
												width:'100%',
												background:'#1f2937',
												padding:14,
												border:'none',
												borderRadius:8,
												borderLeft: `4px solid #9ca3af`,
												textAlign:'left',
												cursor:'pointer',
												display:'flex',
												justifyContent:'space-between',
												alignItems:'center'
											}}
										>
											<div>
												<p style={{margin:0, fontWeight:600, color:'white', marginBottom:4}}>Former Members</p>
												<p style={{margin:0, fontSize:12, color:'#9ca3af'}}>
													{formerMembers.length === 0 ? 'No members' : formerMembers.map(m => m.name.split(' ')[0]).join(', ')}
												</p>
											</div>
											<span style={{color:'#22c55e', fontSize:18}}>
												{isExpanded ? '−' : '+'}
											</span>
										</button>

										{isExpanded && (
											<div style={{background:'#374151', marginTop:0, borderRadius: '0 0 8px 8px', padding:12}}>
												{formerMembers.length === 0 ? (
													<p style={{margin:0, fontSize:13, color:'#9ca3af'}}>No former members added</p>
												) : (
													formerMembers.map(member => (
														<div key={member.id} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid #4b5563'}}>
															<div style={{flex:1}}>
																<p style={{margin:0, fontWeight:500, color:'white'}}>{member.name}</p>
																<p style={{margin:'2px 0 0 0', fontSize:12, color:'#d1d5db'}}>Former</p>
															</div>
															<div style={{display:'flex', gap:6}}>
																<button onClick={() => handleEdit(member)} aria-label="Edit member" title="Edit" style={{width:28, height:28, background:'#22c55e', color:'#fff', border:'none', borderRadius:6, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'}}><EditPencilIcon /></button>
																<button onClick={() => handleDelete(member.id)} aria-label="Delete member" title="Delete" style={{width:28, height:28, background:'#ef4444', color:'#fff', border:'none', borderRadius:6, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'}}><DeleteTrashIcon /></button>
															</div>
														</div>
													))
												)}
											</div>
										)}
									</div>
								);
							})()}
						</div>

						{members.length === 0 && (
							<p style={{color:'#d1d5db', textAlign:'center', marginTop:40}}>No family members added yet</p>
						)}
					</div>
				)}

				{tab === 'cleaning' && (
					<div>
						<div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20}}>
							<button
								onClick={() => setCleaningWeek(prev => shiftWeek(prev, -1))}
								style={{padding:'6px 14px', background:'#374151', color:'white', border:'none', borderRadius:6, cursor:'pointer', fontSize:13}}
							>← Prev</button>
							<p style={{margin:0, fontSize:13, fontWeight:600, textAlign:'center', flex:1}}>{getWeekLabel(cleaningWeek)}</p>
							<button
								onClick={() => setCleaningWeek(prev => shiftWeek(prev, 1))}
								style={{padding:'6px 14px', background:'#374151', color:'white', border:'none', borderRadius:6, cursor:'pointer', fontSize:13}}
							>Next →</button>
						</div>
						{loadingCleaning && <p style={{color:'#d1d5db', textAlign:'center'}}>Loading schedule...</p>}
						{cleaningError && <p style={{color:'#f87171'}}>{cleaningError}</p>}
						{cleaningSchedule.map(record => {
							const meta = CLEANING_META[record.area];
							const assignedMember = members.find(m => m.room === record.assignedRoom && m.status === 'current');
							return (
								<div key={record.area} style={{
									background: record.completed ? '#052e16' : '#1f2937',
									padding:16,
									marginBottom:12,
									borderRadius:8,
									borderLeft: `4px solid ${record.completed ? '#22c55e' : '#4b5563'}`,
								}}>
									<div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
										<div>
											<p style={{margin:'0 0 4px 0', fontSize:16, fontWeight:600}}>{meta.icon} {meta.label}</p>
											<p style={{margin:'0 0 2px 0', fontSize:13, color:'#9ca3af'}}>{record.assignedRoom}</p>
											<p style={{margin:0, fontSize:12, color: assignedMember ? '#d1d5db' : '#6b7280'}}>
												{assignedMember ? assignedMember.name : 'No current resident'}
											</p>
										</div>
										<button
											onClick={() => handleCleaningToggle(record.area)}
											style={{
												padding:'8px 14px',
												background: record.completed ? '#22c55e' : '#374151',
												color: record.completed ? '#fff' : '#d1d5db',
												border:'none',
												borderRadius:20,
												cursor:'pointer',
												fontSize:13,
												fontWeight:500,
												whiteSpace:'nowrap',
											}}
										>
											{record.completed ? '✓ Done' : 'Mark Done'}
										</button>
									</div>
								</div>
							);
						})}
						{!loadingCleaning && cleaningSchedule.length === 0 && !cleaningError && (
							<p style={{color:'#d1d5db', textAlign:'center', marginTop:40}}>No schedule available</p>
						)}
					</div>
				)}

				{tab === 'sticky' && (
					<div>
						<h2 style={{marginTop:0, marginBottom:20}}>Sticky Notes</h2>

						{showStickyModal && (
							<div style={{position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.5)', display:'flex', justifyContent:'center', alignItems:'center', zIndex:1000}}>
								<div style={{background:'black', padding:24, borderRadius:12, width:'90%', maxWidth:400, boxShadow:'0 20px 25px rgba(0,0,0,0.15)'}}>
									<h3 style={{marginTop:0, marginBottom:16}}>Add Sticky Note</h3>
									
								<select 
									value={stickyFormData.name}
									onChange={(e) => setStickyFormData({...stickyFormData, name: e.target.value})}
									style={{width:'100%', padding:10, marginBottom:12, border:'1px solid #d1d5db', borderRadius:6, boxSizing:'border-box', fontSize:14, background:'#374151', color:'white'}}
								>
									<option value="">Select Member</option>
									{members.map(member => (
										<option key={member.id} value={member.name}>{member.name}</option>
									))}
								</select>
									
									<textarea
										placeholder="Description (max 500 chars)"
										value={stickyFormData.description}
										onChange={(e) => setStickyFormData({...stickyFormData, description: e.target.value.slice(0, 500)})}
										style={{width:'100%', padding:10, marginBottom:12, border:'1px solid #d1d5db', borderRadius:6, boxSizing:'border-box', fontSize:14, background:'#374151', color:'white', minHeight:100, fontFamily:'system-ui, sans-serif', resize:'none'}}
									/>
									<p style={{margin:'0 0 16px 0', fontSize:12, color:'#9ca3af'}}>{stickyFormData.description.length}/500</p>

									{stickyNotesError && <p style={{color:'#f87171', margin:'0 0 12px 0', fontSize:13}}>{stickyNotesError}</p>}
									
									<div style={{display:'flex', gap:12}}>
										<button 
											onClick={handleAddStickyNote}
											disabled={!stickyFormData.name || !stickyFormData.description.trim()}
											style={{flex:1, padding:10, background:(!stickyFormData.name || !stickyFormData.description.trim()) ? '#6b7280' : '#22c55e', color:'#fff', border:'none', borderRadius:6, cursor:(!stickyFormData.name || !stickyFormData.description.trim()) ? 'not-allowed' : 'pointer', fontSize:14, fontWeight:500}}
										>
											Add
										</button>
										<button 
											onClick={handleCloseStickyModal}
											style={{flex:1, padding:10, background:'#374151', color:'white', border:'none', borderRadius:6, cursor:'pointer', fontSize:14, fontWeight:500}}
										>
											Cancel
										</button>
									</div>
								</div>
							</div>
						)}

						{loadingStickyNotes && <p style={{color:'#d1d5db', textAlign:'center'}}>Loading notes...</p>}
						{stickyNotes.map(note => (
							<div key={note.id} style={{background:'#fbbf24', padding:14, marginBottom:12, borderRadius:6, position:'relative'}}>
								<div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
									<div style={{flex:1, paddingRight:10}}>
										<p style={{margin:'0 0 6px 0', fontSize:14, fontWeight:600, color:'#1f2937'}}>{note.name}</p>
										<p style={{margin:'0 0 6px 0', fontSize:13, color:'#374151', whiteSpace:'pre-wrap', wordBreak:'break-word'}}>{note.description}</p>
										<p style={{margin:0, fontSize:11, color:'#5a4900'}}>{note.createdAt}</p>
									</div>
									<button
										onClick={() => handleDeleteStickyNote(note.id)}
										style={{width:28, height:28, background:'#ef4444', color:'#fff', border:'none', borderRadius:6, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:14, fontWeight:'bold'}}
									>
										×
									</button>
								</div>
							</div>
						))}
						{!loadingStickyNotes && stickyNotes.length === 0 && !stickyNotesError && (
							<p style={{color:'#d1d5db', textAlign:'center', marginTop:40}}>No sticky notes yet. Tap the + button to add one!</p>
						)}
					</div>
				)}
			</section>

			{tab === 'family' && (
				<button 
					onClick={() => setShowModal(true)}
					style={{
						position: 'fixed',
						bottom: 100,
						right: 16,
						width: 56,
						height: 56,
						background: '#22c55e',
						color: '#fff',
						border: 'none',
						borderRadius: '50%',
						cursor: 'pointer',
						fontSize: 24,
						fontWeight: 'bold',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
						zIndex: 10
					}}
				>
					+
				</button>
			)}

			{tab === 'sticky' && (
				<button 
					onClick={() => setShowStickyModal(true)}
					style={{
						position: 'fixed',
						bottom: 100,
						right: 16,
						width: 56,
						height: 56,
						background: '#84cc16',
						color: '#fff',
						border: 'none',
						borderRadius: '50%',
						cursor: 'pointer',
						fontSize: 24,
						fontWeight: 'bold',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
						zIndex: 10
					}}
				>
					+
				</button>
			)}

			<BottomNav active={tab} onChange={setTab} />
		</main>
	);
}
