import { useRef, useEffect, useState, forwardRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// Define the props type for the QuillWrapper component
interface QuillWrapperProps {
  value: string;
  onChange: (value: string) => void;
  theme?: string;
  placeholder?: string;
  modules?: any;
  style?: React.CSSProperties;
}

// Create a wrapper component for ReactQuill that works with React 19
const QuillWrapper = forwardRef<ReactQuill, QuillWrapperProps>((props, ref) => {
  const { value, onChange, theme = 'snow', placeholder, modules, style } = props;
  const [isMounted, setIsMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<ReactQuill | null>(null);

  // Don't render ReactQuill until the component is mounted
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Apply refs to ReactQuill when available
  useEffect(() => {
    if (ref && typeof ref === 'function' && editorRef.current) {
      ref(editorRef.current);
    } else if (ref && 'current' in ref && editorRef.current) {
      ref.current = editorRef.current;
    }
  }, [ref, editorRef.current]);

  if (!isMounted) {
    return <div ref={containerRef} style={style || { minHeight: '200px', border: '1px solid #ddd' }}></div>;
  }

  return (
    <ReactQuill
      ref={(el) => {
        editorRef.current = el;
      }}
      value={value}
      onChange={onChange}
      theme={theme}
      placeholder={placeholder}
      modules={modules}
      style={style}
    />
  );
});

export default QuillWrapper; 