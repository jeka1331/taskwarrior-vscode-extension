import safeSet from 'licia/safeSet';
import { def } from './setting';
import * as setting from './setting';
import { updateText, getSpace } from './util';

export default function handler(fileName: string, text: string) {
  const json = JSON.parse(text);

  setting.onChange((key, val) => {
    safeSet(json, key, val);

    updateText(JSON.stringify(json, null, getSpace()) + '\n');
  });
  // console.log(json)
  const udas: any[] = [];
  for (let index = 0; index < Object.keys(json).length; index++) {
    const key = Object.keys(json)[index];
    if (!['id', 'description', 'status', 'uuid', 'entry', 'modified'].includes(key)) {
      udas.push([
        'text',
        key,
        json[key],
        key.charAt(0).toUpperCase() + key.slice(1),
      ]);
    }

  }
  if (json.status != "deleted") {
    setting.build([
      // ['markdown', `### ${json.description}`],
      ['title', `[ ${json.id ? json.id : "DELETED"} ]  ${json.description}`],

      [
        'select',
        'status',
        def(json.status, json.status),
        'Status',
        {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          Completed: 'completed',
          // eslint-disable-next-line @typescript-eslint/naming-convention
          Pending: 'pending',
          Waiting: 'waiting',
          Recurring: 'recurring',
          // '': '',
          // '': '',
          // '': '',
        },
      ],
      [
        'text',
        'description',
        json.description,
        'Description',
      ],



    ].concat(udas).concat([[
      'markdown',
      `${JSON.stringify(json, null, 4)}`,
    ]]));
  } else {
    setting.build([
      ['title', `[ ${json.id ? json.id : "DELETED"} ]  ${json.description}`],
      [
        'markdown',
        json.description,
      ],
      [
        'markdown',
        `${JSON.stringify(json, null, 4)}`,
      ]
    ]);
  }

}
