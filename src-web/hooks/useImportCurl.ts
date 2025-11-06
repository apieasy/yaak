import type { HttpRequest } from '@yaakapp-internal/models';
import { patchModelById } from '@yaakapp-internal/models';
import { createRequestAndNavigate } from '../lib/createRequestAndNavigate';
import { jotaiStore } from '../lib/jotai';
import { invokeCmd } from '../lib/tauri';
import { showToast } from '../lib/toast';
import { activeWorkspaceIdAtom } from './useActiveWorkspace';
import { useFastMutation } from './useFastMutation';
import { wasUpdatedExternally } from './useRequestUpdateKey';
import { useActiveEnvironmentVariables } from './useActiveEnvironmentVariables';

export function useImportCurl() {
  const variables = useActiveEnvironmentVariables();

  return useFastMutation({
    mutationKey: ['import_curl'],
    mutationFn: async ({
      overwriteRequestId,
      command,
    }: {
      overwriteRequestId?: string;
      command: string;
    }) => {
      const workspaceId = jotaiStore.get(activeWorkspaceIdAtom);
      const importedRequest: HttpRequest = await invokeCmd('cmd_curl_to_request', {
        command,
        workspaceId,
      });
      variables.forEach((env) => {
        if (env.name == 'base_url') {
          const split = importedRequest.url.split(/\?(.*)/s);
          importedRequest.name = split[0]?.replace(env.value, '') ?? '';
          importedRequest.url = importedRequest.url.replace(env.value, '${[ base_url ]}');
        }
      });

      let verb: string;
      if (overwriteRequestId == null) {
        verb = 'Created';
        await createRequestAndNavigate(importedRequest);
      } else {
        verb = 'Updated';
        await patchModelById(importedRequest.model, overwriteRequestId, (r: HttpRequest) => ({
          ...importedRequest,
          id: r.id,
          createdAt: r.createdAt,
          workspaceId: r.workspaceId,
          folderId: r.folderId,
          sortPriority: r.sortPriority,
        }));

        setTimeout(() => wasUpdatedExternally(overwriteRequestId), 100);
      }

      showToast({
        color: 'success',
        message: `${verb} request from Curl`,
      });
    },
  });
}
