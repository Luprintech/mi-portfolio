// Code Block Themes - Temas de sintaxis para bloques de código

export const CODE_THEMES = {
  dracula: {
    name: 'Dracula',
    background: '#282a36',
    color: '#f8f8f2',
    comment: '#6272a4',
    keyword: '#ff79c6',
    string: '#f1fa8c',
    function: '#50fa7b',
    variable: '#8be9fd',
    number: '#bd93f9',
  },
  nord: {
    name: 'Nord',
    background: '#2e3440',
    color: '#d8dee9',
    comment: '#616e88',
    keyword: '#81a1c1',
    string: '#a3be8c',
    function: '#88c0d0',
    variable: '#8fbcbb',
    number: '#b48ead',
  },
  oneDark: {
    name: 'One Dark',
    background: '#282c34',
    color: '#abb2bf',
    comment: '#5c6370',
    keyword: '#c678dd',
    string: '#98c379',
    function: '#61afef',
    variable: '#e06c75',
    number: '#d19a66',
  },
  nightOwl: {
    name: 'Night Owl',
    background: '#011627',
    color: '#d6deeb',
    comment: '#637777',
    keyword: '#c792ea',
    string: '#ecc48d',
    function: '#82aaff',
    variable: '#7fdbca',
    number: '#f78c6c',
  },
  monokai: {
    name: 'Monokai',
    background: '#272822',
    color: '#f8f8f2',
    comment: '#75715e',
    keyword: '#f92672',
    string: '#e6db74',
    function: '#a6e22e',
    variable: '#66d9ef',
    number: '#ae81ff',
  },
  synthwave: {
    name: 'Synthwave',
    background: '#2b213a',
    color: '#f2f2f2',
    comment: '#848bbd',
    keyword: '#ff7edb',
    string: '#f3f99d',
    function: '#72f1b8',
    variable: '#36f9f6',
    number: '#fe4450',
  },
  github: {
    name: 'GitHub',
    background: '#f6f8fa',
    color: '#24292e',
    comment: '#6a737d',
    keyword: '#d73a49',
    string: '#032f62',
    function: '#6f42c1',
    variable: '#005cc5',
    number: '#005cc5',
  },
  tokyo: {
    name: 'Tokyo Night',
    background: '#1a1b26',
    color: '#a9b1d6',
    comment: '#565f89',
    keyword: '#bb9af7',
    string: '#9ece6a',
    function: '#7aa2f7',
    variable: '#7dcfff',
    number: '#ff9e64',
  },
};

export const DEFAULT_THEME = 'dracula';

export function getCodeTheme(themeName) {
  return CODE_THEMES[themeName] || CODE_THEMES[DEFAULT_THEME];
}

export function getCodeThemesList() {
  return Object.entries(CODE_THEMES).map(([key, theme]) => ({
    value: key,
    label: theme.name,
    preview: theme,
  }));
}

export function getCodeThemeStyles(themeName) {
  const theme = getCodeTheme(themeName);
  
  return `
    background: ${theme.background};
    color: ${theme.color};
    
    .token.comment,
    .token.prolog,
    .token.doctype,
    .token.cdata {
      color: ${theme.comment};
      font-style: italic;
    }
    
    .token.keyword,
    .token.selector,
    .token.important,
    .token.atrule {
      color: ${theme.keyword};
      font-weight: 600;
    }
    
    .token.string,
    .token.char,
    .token.attr-value,
    .token.regex,
    .token.variable {
      color: ${theme.string};
    }
    
    .token.function,
    .token.class-name {
      color: ${theme.function};
    }
    
    .token.property,
    .token.tag,
    .token.boolean,
    .token.constant,
    .token.symbol {
      color: ${theme.variable};
    }
    
    .token.number {
      color: ${theme.number};
    }
    
    .token.operator,
    .token.entity,
    .token.url {
      color: ${theme.color};
      opacity: 0.8;
    }
  `;
}
