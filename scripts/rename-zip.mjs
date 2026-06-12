import { execSync } from 'child_process';
import { renameSync, readdirSync } from 'fs';

const version = '1.0.0';

try {
  const count = execSync('git rev-list --count HEAD', { encoding: 'utf-8' }).trim();
  const files = readdirSync('.output').filter(
    (f) => f === `reddit-image-download-${version}-firefox.zip` || f === `reddit-image-download-${version}-sources.zip`,
  );

  for (const file of files) {
    const newName = file.replace(version, `${version}+build.${count}`);
    renameSync(`.output/${file}`, `.output/${newName}`);
    console.log(`.output/${newName}`);
  }
} catch {
  console.error('Failed to rename zip files');
}
