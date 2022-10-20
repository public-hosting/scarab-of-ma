import { TItemType } from 'lib/items';
import { useEffect, useState } from 'react';

export type TAsset = TItemType | 'start' | 'start-east' | 'start-west' | 'exit-east' | 'exit-west';
export type TLoadedAssets = Record<TAsset, HTMLImageElement>;
type TStatus = 'error' | 'loading' | 'done';

function createAsset(
  url: string,
  onLoad: (error: Event | string | null) => void,
): HTMLImageElement {
  const image = new Image();
  image.onload = () => {
    onLoad(null);
  };
  image.onerror = error => {
    onLoad(error);
  };
  image.src = url;

  return image;
}

export function useAssetsLoad(assets: Record<TAsset, string>):
  | {
      assets: null;
      status: 'loading' | 'error';
    }
  | {
      assets: TLoadedAssets;
      status: 'done';
    } {
  const [loadedAssets, setLoadedAssets] = useState<TLoadedAssets | null>(null);
  const [status, setStatus] = useState<TStatus>('loading');

  useEffect(() => {
    let counter = 0;
    (Object.entries(assets) as [TAsset, string][]).forEach(([name, url]) => {
      const img = createAsset(url, err => {
        counter = counter + 1;

        if (err) {
          setStatus('error');
        } else {
          // @ts-ignore
          setLoadedAssets(x => ({
            ...x,
            [name]: img,
          }));
        }

        if (counter >= Object.keys(assets).length) {
          setStatus(status => (status === 'error' ? 'error' : 'done'));
        }
      });
    });
  }, []);

  // @ts-ignore
  return {
    assets: loadedAssets,
    status,
  };
}
