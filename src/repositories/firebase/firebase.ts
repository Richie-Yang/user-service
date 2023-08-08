import * as _ from 'lodash';
import { firestore } from 'firebase-admin';
import { datasource as db, auth } from './datasource';
import { WhereOperator } from './firebase.variable';
import {
  WhereQuery,
  OrderQuery,
  OrderWhereQuery,
  FilterQuery,
  CollectionRef,
  QueryRef,
  PageResult,
  CreateData,
  UpdateData,
  UserResponse,
  TokenResponse,
} from './firebase.type';

export {
  generateAuthToken,
  signup,
  login,
  create,
  updateById,
  deleteById,
  count,
  findById,
  findPaged,
  findAll,
  findOne,
  getCollectionRef,
  getDocumentRef,
  runTransaction,
};

async function generateAuthToken(uid: string): Promise<TokenResponse> {
  if (!uid) return { err: true };
  return auth()
    .createCustomToken(uid)
    .then((token) => ({ err: false, token }))
    .catch((error) => {
      console.error('Error creating new user:', error);
      return { err: true, error };
    });
}

async function signup(uid: string, userParam: object): Promise<UserResponse> {
  return auth()
    .createUser({ uid, ...userParam })
    .then((userRecord) => {
      console.log('Successfully created new user:', userRecord.toJSON());
      return { err: false, userRecord };
    })
    .catch((error) => {
      console.error('Error creating new user:', error);
      return { err: false, error };
    });
}

async function login(firebaseUid: string): Promise<UserResponse> {
  if (!firebaseUid) return { err: true };
  return auth()
    .getUser(firebaseUid)
    .then((userRecord) => {
      console.log('Successfully get user:', userRecord.toJSON());
      return { err: false, userRecord };
    })
    .catch((error: any) => {
      console.error('Error get user:', error);
      return { err: true, error };
    });
}

async function create<M>(
  collection: string,
  createData: CreateData<M> = {} as M,
  options: { documentId?: string } = {},
) {
  const id = options.documentId || _genRandomCode(12);
  const data = Object.assign(createData, {
    id,
    createdAt: Math.round(Date.now() / 1000),
    updatedAt: Math.round(Date.now() / 1000),
  });
  const res = await db().collection(collection).doc(data.id).set(data);
  return { id, ...res };
}

async function updateById<M>(
  collection: string,
  documentId: string,
  updateData: UpdateData<M> = {},
) {
  updateData.updatedAt = Math.round(Date.now() / 1000);
  return db().collection(collection).doc(documentId).update(updateData);
}

async function deleteById(collection: string, documentId: string) {
  return db().collection(collection).doc(documentId).delete();
}

function count(collection: string) {
  return new Promise((resolve, reject) => {
    const docRef = db().collection(collection);
    docRef
      .get()
      .then((snap) => resolve(snap.size))
      .catch((error) => reject({ error: error }));
  });
}

async function findById(collection: string, documentId: string) {
  const docRef = db().collection(collection).doc(documentId);
  const docSnap = await docRef.get();
  if (docSnap.exists)
    return { docRef, docSnap, data: docSnap.data(), exists: true };
  return { docRef, exists: false };
}

async function findPaged<M>(collection: string, filter?: FilterQuery) {
  const result: PageResult<M> = {
    size: 0,
    page: 0,
    total: 0,
    pageCount: 0,
    rows: [],
  };

  let docRef: QueryRef | CollectionRef = db().collection(collection);
  if (filter?.where) docRef = await _where(docRef, filter.where);
  if (filter?.order) docRef = await _order(docRef, filter.order);

  const allDocs = await docRef.get();
  if (allDocs.empty) return result;
  result.total = allDocs.size;

  const size = filter?.size || 50;
  result.size = size;
  docRef = docRef.limit(size);

  const page = filter?.page || 1;
  result.page = page;
  docRef = docRef.offset(size * (page - 1));

  const docSnap = await docRef.get();
  docSnap.forEach((doc) => {
    result.rows.push(doc.data() as M);
  });

  result.pageCount = Math.ceil(result.total / size);
  return result;
}

async function findAll<M>(collection: string, filter?: OrderWhereQuery) {
  const allDocs: M[] = [];
  let docRef: QueryRef | CollectionRef = db().collection(collection);
  if (filter?.where) docRef = await _where(docRef, filter.where);
  if (filter?.order) docRef = await _order(docRef, filter.order);
  const docSnap = await docRef.get();
  docSnap.forEach((doc) => allDocs.push(doc.data() as M));
  return allDocs;
}

async function findOne<M>(collection: string, filter?: OrderWhereQuery) {
  const allDocs: firestore.DocumentData[] = [];
  let docRef: QueryRef | CollectionRef = db().collection(collection);
  if (filter?.where) docRef = await _where(docRef, filter.where);
  if (filter?.order) docRef = await _order(docRef, filter.order);
  docRef = docRef.limit(1);
  const docSnap = await docRef.get();
  docSnap.forEach((doc) => allDocs.push(doc.data()));
  return _.get(allDocs, '[0]', null) as M | null;
}

async function getCollectionRef(collection: string) {
  return db().collection(collection);
}

async function getDocumentRef(collection: string, documentId: string) {
  return db().collection(collection).doc(documentId);
}

async function runTransaction(
  callback: (t: firestore.Transaction) => Promise<any>,
) {
  return db().runTransaction(callback);
}

async function _where(
  docRef: QueryRef | CollectionRef,
  where: WhereQuery | Array<WhereQuery>,
) {
  let whereDocRef = _.cloneDeep(docRef);
  const searchEntries = (
    Array.isArray(where) ? where : [where]
  ) as Array<WhereQuery>;
  for (const entry of searchEntries) {
    whereDocRef = await _operate(whereDocRef, entry);
  }
  return whereDocRef;
}

async function _order(
  docRef: QueryRef | CollectionRef,
  order: OrderQuery | Array<OrderQuery>,
) {
  let orderDocRef = _.cloneDeep(docRef);
  const orderEntries = (
    Array.isArray(order) ? order : [order]
  ) as Array<OrderQuery>;
  for (const entry of orderEntries) {
    orderDocRef = await orderDocRef.orderBy(entry.fieldKey, entry.fieldValue);
  }
  return orderDocRef;
}

function _operate(docRef: QueryRef | CollectionRef, where: WhereQuery) {
  const { fieldKey, operator, fieldValue } = where;
  switch (operator) {
    case WhereOperator.equal:
      return docRef.where(fieldKey, '==', fieldValue);
    case WhereOperator.gt:
      return docRef.where(fieldKey, '>', fieldValue);
    case WhereOperator.gte:
      return docRef.where(fieldKey, '>=', fieldValue);
    case WhereOperator.lt:
      return docRef.where(fieldKey, '<', fieldValue);
    case WhereOperator.lte:
      return docRef.where(fieldKey, '<=', fieldValue);
    case WhereOperator['array-contains']:
      return docRef.where(fieldKey, 'array-contains', fieldValue);
    case WhereOperator['array-contains-any']:
      return docRef.where(fieldKey, 'array-contains-any', fieldValue);
    case WhereOperator.in:
      return docRef.where(fieldKey, 'in', fieldValue);
    case WhereOperator['not-in']:
      return docRef.where(fieldKey, 'not-in', fieldValue);
    default:
      return docRef;
  }
}

function _genRandomCode(length: number) {
  const char = '1234567890abcdefghijklmnopqrstuvwxyz';
  let code = '';
  for (let i = 0; i < length; i++) {
    code = code + char[Math.floor(Math.random() * char.length)];
  }
  return code;
}
