const fs = require('fs');
let content = fs.readFileSync('frontend/src/components/tables/CrudPage.jsx', 'utf8');

// 1. Add refData state
content = content.replace(
  'const [formData, setFormData] = useState({});',
  'const [formData, setFormData] = useState({});\n  const [refData, setRefData] = useState({});'
);

// 2. Add useEffect for references
const useEffectStr = `
  useEffect(() => {
    const fetchRefs = async () => {
      if (!schema.form) return;
      const refs = schema.form.filter(f => f.type === 'reference');
      const newRefData = { ...refData };
      let changed = false;
      for (const ref of refs) {
        if (!newRefData[ref.endpoint]) {
          try {
            const res = await api.get('/' + ref.endpoint + '?limit=1000');
            newRefData[ref.endpoint] = res.data.data || [];
            changed = true;
          } catch (e) {
            console.error('Failed to fetch ref', ref.endpoint);
          }
        }
      }
      if (changed) setRefData(newRefData);
    };
    fetchRefs();
  }, [schema]);
`;
content = content.replace(
  'useEffect(() => {',
  useEffectStr + '\n  useEffect(() => {'
);

// 3. Add reference field to renderer
const rendererStr = `
                        {f.type === 'reference' ? (
                          <select
                            multiple={f.multiple}
                            required={f.required}
                            disabled={isDisabledOnEdit}
                            className="w-full rounded-xl px-3 py-2 text-sm text-white/80 focus:outline-none transition-all disabled:opacity-30 disabled:cursor-not-allowed custom-scrollbar"
                            style={{ ...fieldStyle, minHeight: f.multiple ? '100px' : '36px' }}
                            value={formData[f.key] || (f.multiple ? [] : '')}
                            onChange={e => {
                              if (f.multiple) {
                                const values = Array.from(e.target.selectedOptions, option => option.value);
                                setFormData({ ...formData, [f.key]: values.join(',') });
                              } else {
                                setFormData({ ...formData, [f.key]: e.target.value });
                              }
                            }}
                          >
                            {!f.multiple && <option value="" style={{ background: '#0c0c18' }}>-- Select {f.label} --</option>}
                            {(refData[f.endpoint] || []).map(opt => (
                              <option key={opt[f.valueKey]} value={opt[f.valueKey]} style={{ background: '#0c0c18', padding: '4px' }}>
                                {opt[f.labelKey]}
                              </option>
                            ))}
                          </select>
                        ) : f.type === 'select' ? (
`;

content = content.replace(
  '{f.type === \'select\' ? (',
  rendererStr
);

fs.writeFileSync('frontend/src/components/tables/CrudPage.jsx', content);
