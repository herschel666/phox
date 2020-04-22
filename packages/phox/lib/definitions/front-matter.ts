declare module 'front-matter' {
  interface FrontMatter {
    attributes: {
      [x: string]: any;
    };
    body: string;
    frontmatter: string;
  }

  function fm(text: string): FrontMatter;

  export = fm;
}
