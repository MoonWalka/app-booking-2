# Snippets VSCode pour les Hooks Génériques

Placez ce fichier dans `.vscode/extensions/snippets/hooks.code-snippets`.

```json
{
  "Generic Entity Search Hook": {
    "prefix": "hookSearch",
    "body": [
      "import useGenericEntitySearch from '@/hooks/common/useGenericEntitySearch';",
      "const ${1:searchHook} = useGenericEntitySearch({",
      "  collectionName: '$2',",
      "  searchFields: ['$3'],",
      "  initialSearchTerm: $4,",
      "  transformResult: $5",
      "});"
    ],
    "description": "Snippet pour créer un hook de recherche générique"
  },
  "Generic Entity Form Hook": {
    "prefix": "hookForm",
    "body": [
      "import useGenericEntityForm from '@/hooks/common/useGenericEntityForm';",
      "const ${1:formHook} = useGenericEntityForm({",
      "  entityType: '$2',",
      "  collectionName: '$3',",
      "  id: $4,",
      "  validationSchema: $5,",
      "  initialData: $6,",
      "  relationConfig: $7",
      "});"
    ],
    "description": "Snippet pour créer un hook de formulaire générique"
  },
  "Generic Entity Details Hook": {
    "prefix": "hookDetails",
    "body": [
      "import useGenericEntityDetails from '@/hooks/common/useGenericEntityDetails';",
      "const ${1:detailsHook} = useGenericEntityDetails({",
      "  entityType: '$2',",
      "  id: $3,",
      "  includeRelations: [$4],",
      "  onDeleteSuccess: $5",
      "});"
    ],
    "description": "Snippet pour créer un hook de détails générique"
  }
}
```