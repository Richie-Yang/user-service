import { firestore } from 'firebase-admin';
import { WhereOperator } from './firebase.variable';
import { UserRecord } from 'firebase-admin/lib/auth/user-record';

export type WhereQuery = {
  fieldKey: string | firestore.FieldPath;
  operator: WhereOperator;
  fieldValue: any;
};

export type OrderQuery = {
  fieldKey: string | firestore.FieldPath;
  fieldValue: firestore.OrderByDirection;
};

export type OrderWhereQuery = {
  order?: OrderQuery | Array<OrderQuery>;
  where?: WhereQuery | Array<WhereQuery>;
};

export type FilterQuery = {
  size?: number;
  page?: number;
  order?: OrderQuery | Array<OrderQuery>;
  where?: WhereQuery | Array<WhereQuery>;
};

export type CollectionRef =
  firestore.CollectionReference<firestore.DocumentData>;

export type DocumentRef = firestore.DocumentReference<firestore.DocumentData>;

export type QueryRef = firestore.Query<firestore.DocumentData>;

export type PageResult<M> = {
  size: number;
  page: number;
  total: number;
  pageCount: number;
  rows: M[];
};

export type CreateData<M> = M & {
  createdAt?: number;
  updatedAt?: number;
};

export type UpdateData<M> = Partial<M> & { updatedAt?: number };

export type UserResponse = {
  err: boolean;
  userRecord?: UserRecord;
  error?: any;
};

export type TokenResponse = {
  err: boolean;
  token?: string;
  error?: any;
};

export type FindByIdResponse<Model> = {
  docRef: FirebaseFirestore.DocumentReference<Model>;
  docSnap: FirebaseFirestore.DocumentSnapshot<Model>;
  data: Model | undefined;
  exists: boolean;
};

export type FindAllResponse<Model> = Array<Model>;

export type FindOneResponse<Model> = Model | null;

export type FindPagedResponse<Model> = {
  size: number;
  page: number;
  total: number;
  pageCount: number;
  rows: Array<Model>;
};
