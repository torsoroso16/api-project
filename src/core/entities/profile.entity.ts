export interface Social {
  type: string;
  link: string;
}

export class Profile {
  constructor(
    public readonly id: number,
    public readonly bio?: string,
    public readonly avatar?: string,
    public readonly contact?: string,
    public readonly socials?: Social[],
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date
  ) {}

  static create(data: {
    bio?: string;
    avatar?: string;
    contact?: string;
    socials?: Social[];
  }): Profile {
    return new Profile(
      0,
      data.bio,
      data.avatar,
      data.contact,
      data.socials,
      new Date(),
      new Date()
    );
  }

  updateBio(bio: string): Profile {
    return new Profile(
      this.id,
      bio,
      this.avatar,
      this.contact,
      this.socials,
      this.createdAt,
      new Date()
    );
  }

  updateAvatar(avatar: string): Profile {
    return new Profile(
      this.id,
      this.bio,
      avatar,
      this.contact,
      this.socials,
      this.createdAt,
      new Date()
    );
  }
}