# tree-sitter-groq

A Tree-sitter grammar for [GROQ](https://sanity-io.github.io/GROQ).

This project isn't quite ready yet, but it can parse some non-trivial queries! For example:

```
================================================================================
Query
================================================================================

*[_type == "project" && _id == $projectId] {
  "navigation": navigation[] {
    ...coalesce(
      select(
        $preview => *[_id == 'drafts.' + ^._ref][0],
        null
      ),
      *[_id == ^._ref][0]
    )
  }
}

--------------------------------------------------------------------------------

(document
  (projection_traversal_expression
    base: (element_access_traversal_expression
      base: (everything_expression)
      idx: (logical_and_expression
        left: (equality_expression
          left: (identifier)
          right: (string
            (string_content)))
        right: (equality_expression
          left: (identifier)
          right: (identifier
            (parameter)))))
    scope: (projection_entry
      (objectEntry
        key: (string
          (string_content))
        value: (projection_traversal_expression
          base: (array_postfix_traversal_expression
            base: (identifier))
          scope: (projection_entry
            (spread_expression
              (func_call_expression
                identifier: (identifier)
                arg: (func_call_expression
                  identifier: (identifier)
                  arg: (pair
                    key: (identifier
                      (parameter))
                    value: (element_access_traversal_expression
                      base: (element_access_traversal_expression
                        base: (everything_expression)
                        idx: (equality_expression
                          left: (identifier)
                          right: (binary_plus_expression
                            left: (string
                              (string_content))
                            right: (attribute_access_traversal_expression
                              base: (parent_expression)
                              scope: (identifier)))))
                      idx: (number)))
                  arg: (null))
                arg: (element_access_traversal_expression
                  base: (element_access_traversal_expression
                    base: (everything_expression)
                    idx: (equality_expression
                      left: (identifier)
                      right: (attribute_access_traversal_expression
                        base: (parent_expression)
                        scope: (identifier))))
                  idx: (number))))))))))
```
