CREATE EXTENSION IF NOT EXISTS "pg_graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "plpgsql";
CREATE EXTENSION IF NOT EXISTS "supabase_vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.7

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: collaborator_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.collaborator_role AS ENUM (
    'reviewer',
    'editor'
);


--
-- Name: comment_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.comment_type AS ENUM (
    'comment',
    'suggestion',
    'approval'
);


--
-- Name: review_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.review_status AS ENUM (
    'pending',
    'in_progress',
    'completed'
);


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;


--
-- Name: update_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: card_comments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.card_comments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    card_id uuid NOT NULL,
    author_id uuid NOT NULL,
    content text NOT NULL,
    comment_type public.comment_type DEFAULT 'comment'::public.comment_type NOT NULL,
    field_name text,
    is_resolved boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: card_reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.card_reviews (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    card_id uuid NOT NULL,
    reviewer_id uuid NOT NULL,
    status public.review_status DEFAULT 'pending'::public.review_status NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    completed_at timestamp with time zone
);


--
-- Name: deck_cards; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.deck_cards (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    deck_id uuid NOT NULL,
    card_slot integer NOT NULL,
    card_type text NOT NULL,
    card_data jsonb DEFAULT '{}'::jsonb NOT NULL,
    is_insight boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    card_image_url text,
    evaluation jsonb,
    last_evaluated_at timestamp with time zone,
    CONSTRAINT deck_cards_card_slot_check CHECK (((card_slot >= 1) AND (card_slot <= 22)))
);


--
-- Name: deck_collaborators; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.deck_collaborators (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    deck_id uuid NOT NULL,
    user_id uuid NOT NULL,
    role public.collaborator_role DEFAULT 'reviewer'::public.collaborator_role NOT NULL,
    invited_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: decks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.decks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    title text NOT NULL,
    description text,
    theme text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    username text,
    avatar_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: prompts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.prompts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    deck_id uuid NOT NULL,
    user_id uuid NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: card_comments card_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.card_comments
    ADD CONSTRAINT card_comments_pkey PRIMARY KEY (id);


--
-- Name: card_reviews card_reviews_card_id_reviewer_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.card_reviews
    ADD CONSTRAINT card_reviews_card_id_reviewer_id_key UNIQUE (card_id, reviewer_id);


--
-- Name: card_reviews card_reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.card_reviews
    ADD CONSTRAINT card_reviews_pkey PRIMARY KEY (id);


--
-- Name: deck_cards deck_cards_deck_id_card_slot_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.deck_cards
    ADD CONSTRAINT deck_cards_deck_id_card_slot_key UNIQUE (deck_id, card_slot);


--
-- Name: deck_cards deck_cards_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.deck_cards
    ADD CONSTRAINT deck_cards_pkey PRIMARY KEY (id);


--
-- Name: deck_collaborators deck_collaborators_deck_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.deck_collaborators
    ADD CONSTRAINT deck_collaborators_deck_id_user_id_key UNIQUE (deck_id, user_id);


--
-- Name: deck_collaborators deck_collaborators_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.deck_collaborators
    ADD CONSTRAINT deck_collaborators_pkey PRIMARY KEY (id);


--
-- Name: decks decks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.decks
    ADD CONSTRAINT decks_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: prompts prompts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prompts
    ADD CONSTRAINT prompts_pkey PRIMARY KEY (id);


--
-- Name: card_comments update_card_comments_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_card_comments_updated_at BEFORE UPDATE ON public.card_comments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


--
-- Name: deck_cards update_deck_cards_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_deck_cards_updated_at BEFORE UPDATE ON public.deck_cards FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


--
-- Name: decks update_decks_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_decks_updated_at BEFORE UPDATE ON public.decks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


--
-- Name: profiles update_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


--
-- Name: card_comments card_comments_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.card_comments
    ADD CONSTRAINT card_comments_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: card_comments card_comments_card_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.card_comments
    ADD CONSTRAINT card_comments_card_id_fkey FOREIGN KEY (card_id) REFERENCES public.deck_cards(id) ON DELETE CASCADE;


--
-- Name: card_reviews card_reviews_card_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.card_reviews
    ADD CONSTRAINT card_reviews_card_id_fkey FOREIGN KEY (card_id) REFERENCES public.deck_cards(id) ON DELETE CASCADE;


--
-- Name: card_reviews card_reviews_reviewer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.card_reviews
    ADD CONSTRAINT card_reviews_reviewer_id_fkey FOREIGN KEY (reviewer_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: deck_cards deck_cards_deck_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.deck_cards
    ADD CONSTRAINT deck_cards_deck_id_fkey FOREIGN KEY (deck_id) REFERENCES public.decks(id) ON DELETE CASCADE;


--
-- Name: deck_collaborators deck_collaborators_deck_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.deck_collaborators
    ADD CONSTRAINT deck_collaborators_deck_id_fkey FOREIGN KEY (deck_id) REFERENCES public.decks(id) ON DELETE CASCADE;


--
-- Name: deck_collaborators deck_collaborators_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.deck_collaborators
    ADD CONSTRAINT deck_collaborators_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: decks decks_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.decks
    ADD CONSTRAINT decks_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: prompts prompts_deck_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prompts
    ADD CONSTRAINT prompts_deck_id_fkey FOREIGN KEY (deck_id) REFERENCES public.decks(id) ON DELETE CASCADE;


--
-- Name: prompts prompts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prompts
    ADD CONSTRAINT prompts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: card_comments Authors can delete their comments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authors can delete their comments" ON public.card_comments FOR DELETE USING ((author_id = auth.uid()));


--
-- Name: card_comments Authors can update their comments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authors can update their comments" ON public.card_comments FOR UPDATE USING ((author_id = auth.uid()));


--
-- Name: card_reviews Card owners can create reviews; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Card owners can create reviews" ON public.card_reviews FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM (public.deck_cards
     JOIN public.decks ON ((decks.id = deck_cards.deck_id)))
  WHERE ((deck_cards.id = card_reviews.card_id) AND (decks.user_id = auth.uid())))));


--
-- Name: card_comments Card owners can resolve comments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Card owners can resolve comments" ON public.card_comments FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM (public.deck_cards
     JOIN public.decks ON ((decks.id = deck_cards.deck_id)))
  WHERE ((deck_cards.id = card_comments.card_id) AND (decks.user_id = auth.uid())))));


--
-- Name: card_reviews Card owners can view reviews on their cards; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Card owners can view reviews on their cards" ON public.card_reviews FOR SELECT USING ((EXISTS ( SELECT 1
   FROM (public.deck_cards
     JOIN public.decks ON ((decks.id = deck_cards.deck_id)))
  WHERE ((deck_cards.id = card_reviews.card_id) AND (decks.user_id = auth.uid())))));


--
-- Name: card_comments Collaborators can add comments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Collaborators can add comments" ON public.card_comments FOR INSERT WITH CHECK (((author_id = auth.uid()) AND (EXISTS ( SELECT 1
   FROM (public.deck_cards
     JOIN public.decks ON ((decks.id = deck_cards.deck_id)))
  WHERE ((deck_cards.id = card_comments.card_id) AND ((decks.user_id = auth.uid()) OR (EXISTS ( SELECT 1
           FROM public.deck_collaborators
          WHERE ((deck_collaborators.deck_id = decks.id) AND (deck_collaborators.user_id = auth.uid()))))))))));


--
-- Name: deck_collaborators Collaborators can view their own records; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Collaborators can view their own records" ON public.deck_collaborators FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: deck_collaborators Deck owners can add collaborators; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Deck owners can add collaborators" ON public.deck_collaborators FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.decks
  WHERE ((decks.id = deck_collaborators.deck_id) AND (decks.user_id = auth.uid())))));


--
-- Name: deck_collaborators Deck owners can remove collaborators; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Deck owners can remove collaborators" ON public.deck_collaborators FOR DELETE USING ((EXISTS ( SELECT 1
   FROM public.decks
  WHERE ((decks.id = deck_collaborators.deck_id) AND (decks.user_id = auth.uid())))));


--
-- Name: deck_collaborators Deck owners can view their deck collaborators; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Deck owners can view their deck collaborators" ON public.deck_collaborators FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.decks
  WHERE ((decks.id = deck_collaborators.deck_id) AND (decks.user_id = auth.uid())))));


--
-- Name: card_reviews Reviewers can update their review status; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Reviewers can update their review status" ON public.card_reviews FOR UPDATE USING ((reviewer_id = auth.uid()));


--
-- Name: card_reviews Reviewers can view their assigned reviews; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Reviewers can view their assigned reviews" ON public.card_reviews FOR SELECT USING ((reviewer_id = auth.uid()));


--
-- Name: deck_cards Users can delete cards in their decks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete cards in their decks" ON public.deck_cards FOR DELETE USING ((EXISTS ( SELECT 1
   FROM public.decks
  WHERE ((decks.id = deck_cards.deck_id) AND (decks.user_id = auth.uid())))));


--
-- Name: decks Users can delete their own decks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own decks" ON public.decks FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: deck_cards Users can insert cards in their decks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert cards in their decks" ON public.deck_cards FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.decks
  WHERE ((decks.id = deck_cards.deck_id) AND (decks.user_id = auth.uid())))));


--
-- Name: decks Users can insert their own decks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own decks" ON public.decks FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: profiles Users can insert their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK ((auth.uid() = id));


--
-- Name: prompts Users can insert their own prompts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own prompts" ON public.prompts FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: deck_cards Users can update cards in their decks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update cards in their decks" ON public.deck_cards FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.decks
  WHERE ((decks.id = deck_cards.deck_id) AND (decks.user_id = auth.uid())))));


--
-- Name: decks Users can update their own decks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own decks" ON public.decks FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: profiles Users can update their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = id));


--
-- Name: profiles Users can view all profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);


--
-- Name: deck_cards Users can view cards in their decks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view cards in their decks" ON public.deck_cards FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.decks
  WHERE ((decks.id = deck_cards.deck_id) AND (decks.user_id = auth.uid())))));


--
-- Name: card_comments Users can view comments on accessible cards; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view comments on accessible cards" ON public.card_comments FOR SELECT USING ((EXISTS ( SELECT 1
   FROM (public.deck_cards
     JOIN public.decks ON ((decks.id = deck_cards.deck_id)))
  WHERE ((deck_cards.id = card_comments.card_id) AND ((decks.user_id = auth.uid()) OR (EXISTS ( SELECT 1
           FROM public.deck_collaborators
          WHERE ((deck_collaborators.deck_id = decks.id) AND (deck_collaborators.user_id = auth.uid())))))))));


--
-- Name: decks Users can view their own decks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own decks" ON public.decks FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: prompts Users can view their own prompts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own prompts" ON public.prompts FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: card_comments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.card_comments ENABLE ROW LEVEL SECURITY;

--
-- Name: card_reviews; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.card_reviews ENABLE ROW LEVEL SECURITY;

--
-- Name: deck_cards; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.deck_cards ENABLE ROW LEVEL SECURITY;

--
-- Name: deck_collaborators; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.deck_collaborators ENABLE ROW LEVEL SECURITY;

--
-- Name: decks; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.decks ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: prompts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--


