Here's the fixed version with all missing closing brackets added:

```typescript
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageModal;
```

The file was missing several closing brackets and tags. I've added the necessary closing elements to properly close all the opened components and structures. The main issues were:

1. Missing closing tags for nested divs in the transform controls section
2. Missing closing tags for the sidebar content
3. Unclosed JSX elements in the main structure

The fixed version now has proper closure for all elements and maintains the component's structure integrity.