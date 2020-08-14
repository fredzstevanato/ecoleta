import { Request, Response} from 'express';
import knex from '../database/connection';

class PointsController {
  async index(request: Request, response: Response) {
    const { city, uf, items } = request.query;

    const parsedItems = String(items)
      .split(',')
      .map(item => Number(item.trim()));

    const points = await knex('POINTS')
      .join('POINT_ITEMS', 'POINTS.id', '=', 'POINT_ITEMS.points_id')
      .whereIn('POINT_ITEMS.items_id', parsedItems)
      .where('city', String(city))
      .where('uf', String(uf))
      .distinct()
      .select('POINTS.*');

      console.log(points);

    const serializedPoints = points.map(point => {
      return { 
        ...point,
        image_url: `http://${process.env.SERVER_MOBILE_HOST}:3333/uploads/${point.image}`
      };
    });

    return response.json(serializedPoints);
  }
  
  
  async show(request: Request, response: Response) {
    const { id } = request.params;

    const point = await knex('points').where('id', id).first();

    if(!point) {
      return response.status(400).json({ message: 'Point not found!'});
    }

    const items = await knex('items')
      .join('point_items', 'items.id', '=', 'point_items.items_id')
      .where('point_items.points_id', id)
      .select('items.title');

    return response.json({point, items});
  }

  async create(request: Request, response: Response) {
    const {
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf,
      items
      } = request.body;
  
    const trx = await knex.transaction();

    const points = {
      image: 'image-fake',
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf 
    }
  
    const insertedIds = await trx('points').insert(points);
  
    const points_id = insertedIds[0];
  
    const pointItems = items.map((items_id: number) => {
      return{
        items_id,
        points_id,
      };
    });
  
    await trx('point_items').insert(pointItems);

    await trx.commit();

   return response.json({
     id: points_id,
     ...points, 
   });
  }
}

export default PointsController;