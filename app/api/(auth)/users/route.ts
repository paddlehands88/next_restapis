import connect from "@/lib/db";
import User from "@/lib/models/user";
import { NextResponse } from "next/server"
import { Types } from 'mongoose';

const ObjectId = require('mongodb').ObjectId;

export const GET = async () => {
  try {
    await connect();
    const users = await User.find();
    return new NextResponse(JSON.stringify(users), {status: 200});

  } catch (error: any) {
    return new NextResponse("Error in fetching users: "+ error.message, {status: 500});
  }
};

export const POST = async (request: Request) => {
  try {
    const body = await request.json();
    await connect();
    const newUser = new User(body);
    await newUser.save();

    return new NextResponse(JSON.stringify({ message: "User created", user: newUser }), {status: 201});

  } catch (error: any) {
    return new NextResponse("Error in creating user: "+ error.message, {status: 500});
  }
};

export const PATCH = async (request: Request) => {
  try {
    const body = await request.json();
    const {userId, newUserName} = body;

    await connect();

    if (!userId || !newUserName) {
      return new NextResponse(
        JSON.stringify({message: "userId or userName not found"}), 
        {status: 400}
        );
    }

    if(!Types.ObjectId.isValid(userId)){
      return new NextResponse(
        JSON.stringify({message: "Invalid userId"}), {status: 400});
    }

    const updatedUser = await User.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { username: newUserName },
      { new: true }
    );

    if(!updatedUser){
      return new NextResponse(
        JSON.stringify({message: "User not found in database"}), 
        {status: 404}
      );
    }

    return new NextResponse(
      JSON.stringify({ message: "User updated", user: updatedUser }), 
      {status: 200}
    );
    
} catch (error: any) {
    return new NextResponse("Error in updating user: "+ error.message, {status: 500});
  }
};

export const DELETE = async (request: Request) => {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return new NextResponse(
        JSON.stringify({message: "userId not found"}), 
        {status: 400}
        );
    }

    if(!Types.ObjectId.isValid(userId)) {
      return new NextResponse(
        JSON.stringify({message: "Invalid userId"}), {status: 400});
    }

    await connect();

    const deletedUser = await User.findByIdAndDelete(new Types.ObjectId(userId));

    if(!deletedUser) {
      return new NextResponse(
        JSON.stringify({message: "User not found in database"}), 
        {status: 404}
      );
    }

    return new NextResponse(
      JSON.stringify({ message: "User deleted", user: deletedUser }), 
      {status: 200}
    );

  } catch (error: any) {
    return new NextResponse("Error in deleting user: "+ error.message, 
      {status: 500}
    );
  }
};