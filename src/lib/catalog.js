import heartImg from '../assets/characters/heart.png';
import brainImg from '../assets/characters/brain.png';
import liverImg from '../assets/characters/liver.png';
import kidneysImg from '../assets/characters/kidneys.png';

// Four organ characters. Add more by dropping PNG into assets/characters/ and adding here.
export const ORGANS = [
  { id: 'heart',   name: 'Heart',   img: heartImg,   tint: '#D56F62' },
  { id: 'brain',   name: 'Brain',   img: brainImg,   tint: '#E8A0A0' },
  { id: 'liver',   name: 'Liver',   img: liverImg,   tint: '#C4584B' },
  { id: 'kidneys', name: 'Kidneys', img: kidneysImg, tint: '#D8775E' },
];

export const organById = (id) => ORGANS.find(o => o.id === id);

// Medical textbooks for the Library. Books unlock as the group hits weekly goal threshold.
export const TEXTBOOKS = [
  { id: 'harrisons',   name: 'Harrison', color: '#A03022' },
  { id: 'robbins',     name: 'Robbins',  color: '#62487A' },
  { id: 'grays',       name: 'Gray',     color: '#2B5F3F' },
  { id: 'bailey',      name: 'Bailey',   color: '#7A3E22' },
  { id: 'park',        name: 'Park',     color: '#B85A1F' },
  { id: 'ganong',      name: 'Ganong',   color: '#1F5B7A' },
  { id: 'sembulingam', name: 'Sembul.',  color: '#5A7A1F' },
  { id: 'katzung',     name: 'Katzung',  color: '#7A1F5B' },
  { id: 'kdt',         name: 'KDT',      color: '#3F2B7A' },
  { id: 'snell',       name: 'Snell',    color: '#2B5F7A' },
  { id: 'guyton',      name: 'Guyton',   color: '#7A5F2B' },
  { id: 'lippincott',  name: 'Lipp.',    color: '#7A2B3F' },
  { id: 'schwartz',    name: 'Schwartz', color: '#506B7A' },
  { id: 'sabiston',    name: 'Sabiston', color: '#4F7A2B' },
];

export const bookById = (id) => TEXTBOOKS.find(t => t.id === id);
