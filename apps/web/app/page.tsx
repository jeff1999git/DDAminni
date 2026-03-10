"use client";

import React, {useState} from 'react';

type Tab = 'family' | 'cleaning' | 'sticky';

type FamilyMember = {
  id: string;
  name: string;
  room: string;
  status: 'current' | 'former';
  phone?: string;
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
	const [showModal, setShowModal] = useState(false);
	const [formData, setFormData] = useState<{name:string, room:string, status:'current'|'former', phone:string}>({name:'', room:'', status:'current', phone:''});
	const [editId, setEditId] = useState<string | null>(null);

	const handleAddMember = () => {
		if (!formData.name.trim() || !formData.room) return;
		if (editId) {
			setMembers(members.map(m => m.id === editId ? {id: editId, ...formData} : m));
			setEditId(null);
		} else {
			setMembers([...members, {id: Date.now().toString(), ...formData}]);
		}
		setFormData({name:'', room:'', status:'current', phone:''});
		setShowModal(false);
	};

	const handleEdit = (member: FamilyMember) => {
		setFormData({name: member.name, room: member.room, status: member.status, phone: member.phone || ''});
		setEditId(member.id);
		setShowModal(true);
	};

	const handleDelete = (id: string) => {
		setMembers(members.filter(m => m.id !== id));
	};

	const handleCloseModal = () => {
		setShowModal(false);
		setEditId(null);
		setFormData({name:'', room:'', status:'current', phone:''});
	};

	const currentMembers = members.filter(m => m.status === 'current');
	const formerMembers = members.filter(m => m.status === 'former');

	return (
		<main style={{paddingBottom: 100, paddingTop:20, paddingLeft:16, paddingRight:16}}>
			<header style={{marginBottom:18}}>
				<h1 style={{margin:0,fontSize:20}}>DD-Aminni</h1>
			</header>

			<section style={{minHeight: '60vh'}}>
				{tab === 'family' && (
					<div>
						<h2 style={{marginTop:0, marginBottom:20}}>Family Members</h2>

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
										<select 
											value={formData.room}
											onChange={(e) => setFormData({...formData, room: e.target.value})}
											style={{width:'100%', padding:10, marginBottom:16, border:'1px solid #d1d5db', borderRadius:6, boxSizing:'border-box', fontSize:14, background:'#374151', color:'white'}}
										>
											<option value="">Select Room</option>
											<option value="Room 1">Room 1</option>
											<option value="Room 2">Room 2</option>
											<option value="Room 3">Room 3</option>
										</select>
									)}

									{formData.status === 'former' && (
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

						{currentMembers.length > 0 && (
							<div style={{marginBottom:20}}>
								<h3 style={{color:'#10b981', marginBottom:12}}>Current Residents ({currentMembers.length})</h3>
								{currentMembers.map(member => (
									<div key={member.id} style={{background:'#1f2937', padding:12, marginBottom:8, borderRadius:6, borderLeft:'4px solid #10b981'}}>
										<div style={{display:'flex', justifyContent:'space-between', alignItems:'start'}}>
											<div style={{flex:1}}>
												<p style={{margin:'0 0 4px 0', fontWeight:500}}>{member.name}</p>
												<p style={{margin:'0 0 4px 0', fontSize:12, color:'#d1d5db'}}>{member.room}</p>
												{member.phone && <p style={{margin:0, fontSize:12, color:'#d1d5db'}}>📞 {member.phone}</p>}
											</div>
											<div style={{display:'flex', gap:8}}>
												<button onClick={() => handleEdit(member)} style={{padding:4, background:'#22c55e', color:'#fff', border:'none', borderRadius:3, cursor:'pointer', fontSize:12}}>Edit</button>
												<button onClick={() => handleDelete(member.id)} style={{padding:4, background:'#ef4444', color:'#fff', border:'none', borderRadius:3, cursor:'pointer', fontSize:12}}>Delete</button>
											</div>
										</div>
									</div>
								))}
							</div>
						)}

						{formerMembers.length > 0 && (
							<div>
								<h3 style={{color:'#d1d5db', marginBottom:12}}>Former Residents ({formerMembers.length})</h3>
								{formerMembers.map(member => (
									<div key={member.id} style={{background:'#374151', padding:12, marginBottom:8, borderRadius:6, borderLeft:'4px solid #9ca3af', opacity:0.7}}>
										<div style={{display:'flex', justifyContent:'space-between', alignItems:'start'}}>
											<div style={{flex:1}}>
												<p style={{margin:'0 0 4px 0', fontWeight:500}}>{member.name}</p>
												<p style={{margin:'0 0 4px 0', fontSize:12, color:'#d1d5db'}}>{member.room}</p>
												{member.phone && <p style={{margin:0, fontSize:12, color:'#d1d5db'}}>📞 {member.phone}</p>}
											</div>
											<div style={{display:'flex', gap:8}}>
												<button onClick={() => handleEdit(member)} style={{padding:4, background:'#22c55e', color:'#fff', border:'none', borderRadius:3, cursor:'pointer', fontSize:12}}>Edit</button>
												<button onClick={() => handleDelete(member.id)} style={{padding:4, background:'#ef4444', color:'#fff', border:'none', borderRadius:3, cursor:'pointer', fontSize:12}}>Delete</button>
											</div>
										</div>
									</div>
								))}
							</div>
						)}

						{members.length === 0 && (
							<p style={{color:'#d1d5db', textAlign:'center', marginTop:40}}>No family members added yet</p>
						)}
					</div>
				)}

				{tab === 'cleaning' && (
					<div>
						<h2>Cleaning</h2>
						<p>Track cleaning schedules, logs, and supplies.</p>
					</div>
				)}

				{tab === 'sticky' && (
					<div>
						<h2>Sticky notes</h2>
						<p>Short notes and reminders for the household.</p>
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

			<BottomNav active={tab} onChange={setTab} />
		</main>
	);
}
