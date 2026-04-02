import { useQuery } from "@tanstack/react-query";
import { getUserFriends } from "../lib/api";
import { Link } from "react-router";
import { UsersIcon, ArrowLeftIcon } from "lucide-react";

import FriendCard from "../components/FriendCard";
import NoFriendsFound from "../components/NoFriendsFound";

const FriendsPage = () => {
  const { data: friends = [], isLoading: loadingFriends } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto space-y-8">
        {/* Header with back button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link 
              to="/" 
              className="btn btn-ghost btn-sm"
              title="Back to Home"
            >
              <ArrowLeftIcon className="size-4" />
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Your Friends</h1>
              <p className="text-base-content opacity-70 mt-1">
                {friends.length > 0 
                  ? `You have ${friends.length} friend${friends.length === 1 ? '' : 's'}`
                  : "Start building your language learning network"
                }
              </p>
            </div>
          </div>
          
          <Link to="/notifications" className="btn btn-outline btn-sm">
            <UsersIcon className="mr-2 size-4" />
            Friend Requests
          </Link>
        </div>

        {/* Friends Grid */}
        {loadingFriends ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : friends.length === 0 ? (
          <NoFriendsFound />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {friends.map((friend) => (
              <FriendCard key={friend._id} friend={friend} />
            ))}
          </div>
        )}

        {/* Quick Actions */}
        {friends.length > 0 && (
          <div className="card bg-base-200 p-6">
            <div className="text-center space-y-4">
              <h3 className="font-semibold text-lg">Want to meet more language partners?</h3>
              <p className="text-base-content opacity-70">
                Discover new learners who match your language goals
              </p>
              <Link to="/" className="btn btn-primary">
                Find New Partners
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendsPage;
