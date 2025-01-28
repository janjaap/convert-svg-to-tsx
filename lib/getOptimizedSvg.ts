import { transform } from '@svgr/core';
import { parse } from 'node:path';
import { optimize } from 'svgo';
import { getComponentName } from './getComponentName';

export function getOptimizedSvg(filePath: string, data: string) {
  const { dir } = parse(filePath);
  const componentName = getComponentName(filePath);

  const { data: optimizedData } = optimize(data, {
    multipass: true,
    plugins: [
      'cleanupAttrs',
      'collapseGroups',
      'convertStyleToAttrs',
      'removeComments',
      'removeDoctype',
      'removeUselessDefs',
      'removeXlink',
      'removeXMLNS',
      'sortAttrs',
      {
        name: 'removeAttrs',
        params: {
          attrs: '(data-name)',
        },
      },
    ],
  });

  const content = transform.sync(
    optimizedData,
    {
      exportType: 'named',
      jsxRuntime: 'automatic',
      namedExport: componentName,
      plugins: ['@svgr/plugin-svgo', '@svgr/plugin-jsx'],
      typescript: true,
    },
    { componentName },
  );

  const componentFilePath = `${dir}/${componentName}.tsx`;
  const filename = componentFilePath.split('/').pop()!;

  return {
    content,
    componentFilePath,
    filename,
  };
}
