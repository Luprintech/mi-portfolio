import DocumentBlock from './renderers/DocumentBlock';

export default function DocumentEmbed({ src, filename, fileType, displayMode, embedHeight }) {
  return (
    <DocumentBlock
      src={src}
      filename={filename}
      fileType={fileType}
      display={displayMode}
      embedHeight={embedHeight}
    />
  );
}
