export const damageTypes = [
  { id: 'bludgeoning', name: 'Contundente', color: '#a1887f' }, // Brown
  { id: 'piercing', name: 'Perforante', color: '#757575' },    // Grey
  { id: 'slashing', name: 'Cortante', color: '#bdbdbd' },      // Light Grey
  { id: 'acid', name: 'Ácido', color: '#8bc34a' },             // Lime Green
  { id: 'cold', name: 'Frío', color: '#26c6da' },             // Cyan
  { id: 'fire', name: 'Fuego', color: '#ff7043' },             // Deep Orange
  { id: 'force', name: 'Fuerza', color: '#ab47bc' },             // Purple
  { id: 'lightning', name: 'Eléctrico', color: '#ffca28' },   // Amber
  { id: 'necrotic', name: 'Necrótico', color: '#546e7a' },   // Blue Grey
  { id: 'poison', name: 'Veneno', color: '#66bb6a' },             // Green
  { id: 'psychic', name: 'Psíquico', color: '#ec407a' },       // Pink
  { id: 'radiant', name: 'Radiante', color: '#ffee58' },     // Yellow
  { id: 'thunder', name: 'Trueno', color: '#7e57c2' },       // Deep Purple
];

export const getColorForType = (typeId) => {
  const type = damageTypes.find(t => t.id === typeId);
  return type ? type.color : '#ffffff'; // Default to white
};
