
import React from 'react';
import { FaBold, FaItalic, FaListUl, FaLink, FaHeading } from 'react-icons/fa';

interface EditorProps {
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
    className?: string;
}

export const RichTextEditor: React.FC<EditorProps> = ({ value, onChange, placeholder, className }) => {
    const insertFormat = (prefix: string, suffix: string = '') => {
        const textarea = document.querySelector(`textarea[name="rich-editor"]`) as HTMLTextAreaElement;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const before = text.substring(0, start);
        const selection = text.substring(start, end);
        const after = text.substring(end);

        const newText = `${before}${prefix}${selection}${suffix}${after}`;
        onChange(newText);
        
        // Restore focus
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + prefix.length, end + prefix.length);
        }, 0);
    };

    return (
        <div className={`border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-700 ${className}`}>
            <div className="flex items-center gap-1 p-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-600">
                <button type="button" onClick={() => insertFormat('**', '**')} className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300" title="Bold"><FaBold size={12} /></button>
                <button type="button" onClick={() => insertFormat('*', '*')} className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300" title="Italic"><FaItalic size={12} /></button>
                <button type="button" onClick={() => insertFormat('### ', '')} className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300" title="Heading"><FaHeading size={12} /></button>
                <button type="button" onClick={() => insertFormat('- ', '')} className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300" title="List"><FaListUl size={12} /></button>
                <button type="button" onClick={() => insertFormat('[', '](url)')} className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300" title="Link"><FaLink size={12} /></button>
            </div>
            <textarea
                name="rich-editor"
                className="w-full p-3 min-h-[150px] outline-none bg-transparent dark:text-white resize-y"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
};

interface DisplayProps {
    content: string;
    className?: string;
}

export const RichTextDisplay: React.FC<DisplayProps> = ({ content, className }) => {
    if (!content) return null;

    const renderContent = (text: string) => {
        const lines = text.split('\n');
        return lines.map((line, idx) => {
            // Heading 3
            if (line.startsWith('### ')) {
                return <h3 key={idx} className="text-lg font-bold my-2">{parseInline(line.replace('### ', ''))}</h3>;
            }
            // List Item
            if (line.startsWith('- ')) {
                return <li key={idx} className="ml-4 list-disc">{parseInline(line.replace('- ', ''))}</li>;
            }
            // Empty line
            if (line.trim() === '') {
                return <br key={idx} />;
            }
            // Paragraph
            return <p key={idx} className="mb-1 leading-relaxed">{parseInline(line)}</p>;
        });
    };

    const parseInline = (text: string): React.ReactNode[] => {
        // Tokenizer approach for better nesting handling
        // Simple regex strategy for this demo:
        // 1. Links: [text](url) or raw https://
        // 2. Bold: **text**
        // 3. Italic: *text*
        
        let parts: React.ReactNode[] = [text];

        // Process Links [text](url)
        parts = processRegex(parts, /\[(.*?)\]\((.*?)\)/g, (match, i) => (
            <a key={`link-${i}`} href={match[2]} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">{match[1]}</a>
        ));

        // Process Raw URLs
        parts = processRegex(parts, /(https?:\/\/[^\s\)]+)/g, (match, i) => (
            <a key={`rawlink-${i}`} href={match[1]} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">{match[1]}</a>
        ));

        // Process Bold **text**
        parts = processRegex(parts, /\*\*(.*?)\*\*/g, (match, i) => (
            <strong key={`bold-${i}`}>{match[1]}</strong>
        ));

        // Process Italic *text*
        parts = processRegex(parts, /\*(.*?)\*/g, (match, i) => (
            <em key={`italic-${i}`}>{match[1]}</em>
        ));

        return parts;
    };

    const processRegex = (nodes: React.ReactNode[], regex: RegExp, render: (match: RegExpExecArray, i: number) => React.ReactNode) => {
        const newNodes: React.ReactNode[] = [];
        nodes.forEach((node) => {
            if (typeof node !== 'string') {
                newNodes.push(node);
                return;
            }
            
            let lastIndex = 0;
            let match;
            // Reset regex state
            regex.lastIndex = 0;
            
            while ((match = regex.exec(node)) !== null) {
                // Push text before match
                if (match.index > lastIndex) {
                    newNodes.push(node.substring(lastIndex, match.index));
                }
                // Push match
                newNodes.push(render(match, newNodes.length));
                lastIndex = regex.lastIndex;
            }
            // Push remaining text
            if (lastIndex < node.length) {
                newNodes.push(node.substring(lastIndex));
            }
        });
        return newNodes;
    };

    return <div className={`text-gray-800 dark:text-gray-200 ${className}`}>{renderContent(content)}</div>;
};
