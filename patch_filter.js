const fs = require('fs');
let content = fs.readFileSync('frontend/src/components/tables/CrudPage.jsx', 'utf8');

// 1. Add filterValue state
content = content.replace(
  'const [searchQuery, setSearchQuery] = useState(\'\');',
  'const [searchQuery, setSearchQuery] = useState(\'\');\n  const [filterValue, setFilterValue] = useState(\'\');'
);

// 2. Clear filterValue when schema changes
content = content.replace(
  'setSearchQuery(\'\');',
  'setSearchQuery(\'\');\n    setFilterValue(\'\');'
);

// 3. Update fetchData
content = content.replace(
  'let url = `/${schema.endpoint}?page=${page}&limit=${limit}`;',
  'let url = `/${schema.endpoint}?page=${page}&limit=${limit}`;\n      if (schema.filterBy && filterValue) url += `&${schema.filterBy.key}=${filterValue}`;'
);

// 4. Update refData fetch to also fetch filter references if not already in form
// Actually, filterBy reference is highly likely to be in the form (like Category). So refData[schema.filterBy.endpoint] will exist.

// 5. Add filter UI to the header
const filterHtml = `
            {/* Filter Dropdown */}
            {schema.filterBy && (
              <div className="relative">
                <select
                  value={filterValue}
                  onChange={(e) => {
                    setFilterValue(e.target.value);
                    setPage(1);
                  }}
                  className="pl-3 pr-8 py-2 rounded-xl text-sm bg-white/5 border border-white/10 text-white focus:outline-none focus:border-indigo-500/50 transition-colors appearance-none"
                  style={{ minWidth: '150px' }}
                >
                  <option value="">All {schema.filterBy.label}s</option>
                  {(refData[schema.filterBy.endpoint] || []).map(opt => (
                    <option key={opt[schema.filterBy.valueKey]} value={opt[schema.filterBy.valueKey]}>
                      {opt[schema.filterBy.labelKey]}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            {/* Search */}
`;
content = content.replace('{/* Search */}', filterHtml);

// 6. Ensure fetchItems dependency includes filterValue
content = content.replace(
  'useEffect(() => {\n    fetchItems();\n  }, [page, schema, searchQuery]);',
  'useEffect(() => {\n    fetchItems();\n  }, [page, schema, searchQuery, filterValue]);'
);

fs.writeFileSync('frontend/src/components/tables/CrudPage.jsx', content);
