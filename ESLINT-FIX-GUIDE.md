
# ESLint Issues Fix Guide

The following types of issues were disabled in .eslintrc.json:

1. **Unused Variables (@typescript-eslint/no-unused-vars)**
   - Remove imports that aren't used
   - Remove declared variables that aren't referenced
   
2. **Use of 'any' type (@typescript-eslint/no-explicit-any)**
   - Replace with appropriate types
   - Use TypeScript interfaces or type aliases
   
3. **Missing dependencies in hooks (react-hooks/exhaustive-deps)**
   - Add missing dependencies to useEffect/useCallback dependency arrays
   - Or use useRef for values you don't want to trigger re-renders
   
4. **Fast refresh issues (react-refresh/only-export-components)**
   - Move non-component functions to separate files
   - Keep component files focused on just the component
   
5. **Lexical declarations in case blocks (no-case-declarations)**
   - Move variable declarations outside the case block
   - Or wrap the case block in curly braces

When you're ready to properly fix these issues:
1. Remove .eslintrc.json
2. Run `npx eslint . --ext .js,.jsx,.ts,.tsx` to see all issues
3. Fix each one according to the guidelines above
