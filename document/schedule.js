const {Model,ObjectId,makeSureItIsMongoObjectId}=require('../db');

class Schedule extends Model{
	collection(){
		return 'schedule';
	}

	async newOne({year,semester,user,name,teacher,place,day,session,week}){
		this.set('year',year);
		this.set('semester',semester);
		this.set('user',user);
		this.set('name',name);
		this.set('teacher',teacher);
		this.set('place',place);
		this.set('day',day);
		this.set('session',session);
		this.set('week',week);

		return await this.save();
	}
}

Schedule.use((BeExtended)=>{

});

module.exports=Schedule;
