import * as bcrypt from 'bcrypt';
import { User } from './user.model';

describe('User model', () => {
  it('hashes the password before the user is created', async () => {
    const user = { password: 'secret' } as User;

    await User.hashPassword(user);

    expect(user.password).not.toBe('secret');
    await expect(bcrypt.compare('secret', user.password)).resolves.toBe(true);
  });
});
